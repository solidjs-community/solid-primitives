import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { PACKAGES_DIR, isNonNullable } from "./utils.js";
import * as vb from "valibot";

export type ModuleData = {
  name: string;
  version: string;
  description: string;
  tags: string[];
  category: string;
  stage: number;
  primitives: string[];
  localDependencies: string[];
  peerDependencies: string[];
};

const pkg_schema = vb.object({
  name: vb.string(),
  version: vb.string(),
  description: vb.string(),
  keywords: vb.optional(vb.array(vb.string())),
  dependencies: vb.optional(vb.record(vb.string())),
  peerDependencies: vb.record(vb.string()),
  primitive: vb.object({
    list: vb.array(vb.string()),
    category: vb.string(),
    stage: vb.number(),
  }),
});

export type ModulePkgSchema = typeof pkg_schema;
export type ModulePkg = vb.Output<ModulePkgSchema>;

export function getPackagePackageJson(name: string): ModulePkg | Error {
  const pkg_path = path.join(PACKAGES_DIR, name, "package.json");

  if (!fs.existsSync(pkg_path)) {
    return new Error(`package ${name} doesn't have package.json`);
  }

  const pkg = JSON.parse(fs.readFileSync(pkg_path, "utf8")) as unknown;
  const result = vb.safeParse(pkg_schema, pkg);

  if (!result.success) {
    const issue = result.issues[0];
    return new Error(`package ${name} has invalid package.json: ${issue.message}`);
  }

  return result.output;
}

export async function getModulesData(): Promise<ModuleData[]>;
export async function getModulesData<T>(mapFn: (data: ModuleData) => T | Promise<T>): Promise<T[]>;
export async function getModulesData<T = ModuleData>(
  mapFn: (data: ModuleData) => T = moduleData => moduleData as unknown as T,
): Promise<T[]> {
  const packageNames = await fsp.readdir(PACKAGES_DIR);

  const promises = packageNames.map(async name => {
    const pkg = getPackagePackageJson(name);

    if (pkg instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(pkg);
      return null;
    }

    const dependencies = Object.keys(pkg.dependencies ?? {});
    const peerDependencies = Object.keys(pkg.peerDependencies);
    const localDependencies = dependencies.filter(dep => dep.startsWith("@solid-primitives/"));

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
        localDependencies,
        peerDependencies,
      }),
    };
  });

  return (await Promise.all(promises)).filter(isNonNullable).map(a => a.data);
}
