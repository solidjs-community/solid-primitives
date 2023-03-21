import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { marked } from "marked";
import { getModulesData, ModuleData } from "../../scripts/get-modules-data";
import { getExportBundlesize, formatBytes } from "../../scripts/calculate-bundlesize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitePath = path.join(__dirname, "..");
const generatedDirPath = path.join(sitePath, "src", "_generated");
const packagesDist = path.join(generatedDirPath, "packages");
const listDist = path.join(generatedDirPath, "packages.json");

const PACKAGE_COLLAPSED_LIST_OF_PRIMITIVES = ["signal-builders", "platform", "immutable"] as const;

export type PackageData = ModuleData & {
  readme: string;
  exports: {
    name: string;
    min: string;
    gzip: string;
  }[];
};

export async function generatePackagesData() {
  if (!fs.existsSync(packagesDist)) {
    await fsp.mkdir(packagesDist);
  }

  const modules = await getModulesData(async module => {
    const [readme, exports] = await Promise.all([
      // parse readme and generate html
      (async () => {
        const readme = await fsp.readFile(path.join(module.path, "README.md"), "utf8");
        return marked(readme, { async: true });
      })(),
      // calculate bundle size
      PACKAGE_COLLAPSED_LIST_OF_PRIMITIVES.includes(module.name as any)
        ? []
        : Promise.all(
            module.primitives.map(async primitive => {
              const result = await getExportBundlesize({
                type: "export",
                packageName: module.name,
                exportName: primitive,
              });
              return result
                ? {
                    name: primitive,
                    min: formatBytes(result.minifiedSize).string,
                    gzip: formatBytes(result.gzippedSize).string,
                  }
                : null;
            }),
          ).then(results =>
            results.filter(<T>(result: T): result is NonNullable<T> => result !== null),
          ),
    ] as const);

    const data: PackageData = { ...module, readme, exports };

    // write data to individual json file
    const outputFilename = path.join(packagesDist, `${module.name}.json`);
    await fsp.writeFile(outputFilename, JSON.stringify(data, null, 2));

    return module.name;
  });

  // gather all module names into one json file
  await fsp.writeFile(listDist, JSON.stringify(modules, null, 2));

  return modules;
}
