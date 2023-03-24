import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { PackageJson } from "type-fest";
import { isNonNullable } from "./utils";

export type ModulePkg = PackageJson & {
  primitive?: {
    list?: string[];
    category?: string;
    stage?: number;
  };
};

export type ModuleData = {
  name: string;
  version: string;
  category: string;
  stage: number;
  primitives: string[];
  localDependencies: string[];
  peerDependencies: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootPath = path.join(__dirname, "..");
const packagesPath = path.join(rootPath, "packages");

export async function getModulesData(): Promise<ModuleData[]>;
export async function getModulesData<T>(mapFn: (data: ModuleData) => T | Promise<T>): Promise<T[]>;
export async function getModulesData<T = ModuleData>(
  mapFn: (data: ModuleData) => T = moduleData => moduleData as unknown as T,
): Promise<T[]> {
  const packageNames = await fsp.readdir(packagesPath);

  const promises = packageNames.map(async name => {
    const packageJsonPath = path.join(packagesPath, name, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      // eslint-disable-next-line no-console
      console.warn(`package ${name} doesn't have package.json`);
      return null;
    }

    const pkg = JSON.parse(await fsp.readFile(packageJsonPath, "utf8")) as ModulePkg;
    if (!pkg.primitive) {
      // eslint-disable-next-line no-console
      console.warn(`package ${name} doesn't have primitive field in package.json`);
      return null;
    }

    const dependencies = Object.keys(pkg.dependencies ?? {});
    const peerDependencies = Object.keys(pkg.peerDependencies ?? {});
    const localDependencies = dependencies.filter(dep => dep.startsWith("@solid-primitives/"));

    return {
      data: await mapFn({
        name,
        version: pkg.version ?? "0.0.0",
        category: pkg.primitive.category ?? "Misc",
        stage: pkg.primitive.stage ?? 0,
        primitives: pkg.primitive.list ?? [],
        localDependencies,
        peerDependencies,
      }),
    };
  });

  return (await Promise.all(promises)).filter(isNonNullable).map(a => a.data);
}
