import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { MODULE_PREFIX, PACKAGES_DIR, isNonNullable, logLine } from "./utils.js";
import * as vb from "valibot";

const pkg_schema = vb.object({
  name: vb.string(),
  version: vb.string(),
  description: vb.string(),
  keywords: vb.optional(vb.array(vb.string())),
  dependencies: vb.optional(vb.record(vb.string())),
  peerDependencies: vb.record(vb.string()),
  primitive: vb.object(
    {
      list: vb.array(vb.string()),
      category: vb.string(),
      stage: vb.number(),
    },
    'package.json lacks "primitive" filed',
  ),
});

export type ModulePkgSchema = typeof pkg_schema;
export type ModulePkg = vb.Output<ModulePkgSchema>;

export function getPackagePkg(name: string): ModulePkg | Error {
  const pkg_path = path.join(PACKAGES_DIR, name, "package.json");

  if (!fs.existsSync(pkg_path)) {
    return new Error(`package "${name}" doesn't have package.json`);
  }

  const pkg = JSON.parse(fs.readFileSync(pkg_path, "utf8")) as unknown;
  const result = vb.safeParse(pkg_schema, pkg);

  if (!result.success) {
    const issue = result.issues[0];
    return new Error(`package "${name}" has invalid package.json: ${issue.message}`);
  }

  return result.output;
}

export type ModuleData = {
  name: string;
  version: string;
  description: string;
  tags: string[];
  category: string;
  stage: number;
  primitives: string[];
  workspace_deps: string[];
  peer_deps: string[];
};

export async function getModulesData(): Promise<ModuleData[]>;
export async function getModulesData<T>(mapFn: (data: ModuleData) => T | Promise<T>): Promise<T[]>;
export async function getModulesData<T = ModuleData>(
  mapFn: (data: ModuleData) => T = moduleData => moduleData as unknown as T,
): Promise<T[]> {
  const module_names = await fsp.readdir(PACKAGES_DIR);

  const promises = module_names.map(async name => {
    const pkg = getPackagePkg(name);

    if (pkg instanceof Error) {
      logLine(pkg.message);
      return null;
    }

    const dependencies = Object.keys(pkg.dependencies ?? {});
    const peer_deps = Object.keys(pkg.peerDependencies);
    const workspace_deps: string[] = [];

    for (const dep of dependencies) {
      if (dep.startsWith(MODULE_PREFIX)) {
        const dep_name = dep.slice(MODULE_PREFIX.length);
        workspace_deps.push(dep_name);
      }
    }

    const excludedKeywords = ["primitive", "solid", pkg.name];

    return {
      data: await mapFn({
        name,
        version: pkg.version,
        description: pkg.description,
        tags: pkg.keywords?.filter(keyword => !excludedKeywords.includes(keyword)) ?? [],
        category: pkg.primitive.category,
        stage: pkg.primitive.stage,
        primitives: pkg.primitive.list,
        workspace_deps,
        peer_deps,
      }),
    };
  });

  return (await Promise.all(promises)).filter(isNonNullable).map(a => a.data);
}
