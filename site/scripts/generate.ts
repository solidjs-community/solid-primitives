import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import { marked } from "marked";
import { getModulesData } from "../../scripts/get-modules-data";
import { getPackageBundlesize, formatBytes } from "../../scripts/calculate-bundlesize";
import { PackageData } from "~/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitePath = path.join(__dirname, "..");
const generatedDirPath = path.join(sitePath, "src", "_generated");
const packagesDist = path.join(generatedDirPath, "packages");
const listDist = path.join(generatedDirPath, "packages.json");

const PACKAGE_COLLAPSED_LIST_OF_PRIMITIVES = ["signal-builders", "platform", "immutable"] as const;

(async () => {
  if (!fs.existsSync(packagesDist)) {
    await fsp.mkdir(packagesDist);
  }

  const modules = await getModulesData(async module => {
    const [readme, primitives, packageSize] = await Promise.all([
      // parse readme and generate html
      (async () => {
        const readme = await fsp.readFile(path.join(module.path, "README.md"), "utf8");
        return marked(readme, { async: true });
      })(),
      // calculate individual exports bundle size
      PACKAGE_COLLAPSED_LIST_OF_PRIMITIVES.includes(module.name as any)
        ? []
        : Promise.all(
            module.primitives.map(async primitive => {
              const result = await getPackageBundlesize(module.name, { exportName: primitive });
              if (!result) return null;
              return {
                name: primitive,
                min: formatBytes(result.min).string,
                gzip: formatBytes(result.gzip).string,
              };
            }),
          ).then(results =>
            results.filter(<T>(result: T): result is NonNullable<T> => result !== null),
          ),
      // calculate module bundle size
      (async () => {
        const result = await getPackageBundlesize(module.name);
        if (!result) return null;
        return {
          min: formatBytes(result.min).string,
          gzip: formatBytes(result.gzip).string,
        };
      })(),
    ] as const);

    const data: PackageData = { ...module, readme, primitives, packageSize };

    // write data to individual json file
    const outputFilename = path.join(packagesDist, `${module.name}.json`);
    await fsp.writeFile(outputFilename, JSON.stringify(data, null, 2));

    return module.name;
  });

  // gather all module names into one json file
  await fsp.writeFile(listDist, JSON.stringify(modules, null, 2));

  // eslint-disable-next-line no-console
  console.log(`\nGenerated data for ${modules.length} packages.\n`);
})();
