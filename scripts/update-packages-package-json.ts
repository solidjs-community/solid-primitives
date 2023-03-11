import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { PackageJSONData } from "./update-site";
import { r, regexGlobalCaptureGroup } from "./utils";

console.log("updatePackagesPackageJSON", "Updating packages' package.json");

const generatedDir = r(`../site/src/_generated`);
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir);
}
const packageCollapsedListOfPrimitives = ["signal-builders", "platform"];
const maximumPrimitivesCount = 30;

const packageFiles = readdirSync(r(`../packages/`));
const run = async () => {
  for (const name of packageFiles) {
    const packageJsonPath = r(`../packages/${name}/package.json`);
    if (!existsSync(packageJsonPath)) return;
    const pkgFile = readFileSync(packageJsonPath, "utf8");
    const pkg = JSON.parse(pkgFile) as PackageJSONData;

    if (!pkg.primitive) {
      console.warn(`package ${name} doesn't have primitive field in package.json`);
      continue;
    }

    if (pkg.primitive.name !== name) {
      console.warn(
        `directory name (${name}) and name in package info ${pkg.primitive.name} do not match`,
      );
      continue;
    }
    if (pkg.primitive?.list[0]?.match(/list of/gi)) {
      continue;
    }

    const { list } = pkg.primitive;
    let expandedList: string[] = list;

    // get primitives from src directory
    const packageIndex = r(`../packages/${name}/src/index.ts`);
    const indexFile = readFileSync(packageIndex, "utf-8");

    const resultStar = regexGlobalCaptureGroup(
      indexFile,
      /export\s+\*\sfrom\s+"[^"]+\/([a-z-_]+)"/gi,
    );

    let concatFile = indexFile;

    const capturePrimitives = (fileStr: string) => {
      const resultExportDeclarations = regexGlobalCaptureGroup(
        fileStr,
        /export\s+(?:(?:async|default)\s+)?(?:const|function\*?|let|class)\s+(\w+)/g,
      );

      const resultExportList = regexGlobalCaptureGroup(fileStr, /export\s+\{([^}]+)\}/g)
        ?.flatMap(item => item.replace(/(type|as|default)\s\w+/g, "").match(/\w+/g))
        .filter(item => item);

      expandedList = [...(resultExportDeclarations || []), ...(resultExportList || [])];
    };

    if (resultStar) {
      resultStar.forEach(item => {
        const dir = r(`../packages/${name}/src/${item}.ts`);
        const indexFile = readFileSync(dir, "utf-8");
        concatFile += indexFile;
      });
    }

    capturePrimitives(concatFile);

    const _primitives = [...new Set(expandedList)]
      // remove CONSTANTS
      .filter(item => item !== item?.toUpperCase())
      .sort();

    if (
      _primitives.length > maximumPrimitivesCount &&
      !pkg.primitive?.list[0]?.match(/list of/gi) &&
      !packageCollapsedListOfPrimitives.includes(name)
    ) {
      console.warn(
        `package ${name} has more than ${maximumPrimitivesCount} primitives, author should replace primitive.list in package.json with array with one item with string value of "List of [item-type]"`,
      );
    }

    if (pkg.primitive) {
      pkg.primitive = {
        ...pkg.primitive,
        list: _primitives,
      };
    }

    writeFileSync(packageJsonPath, JSON.stringify(pkg));
  }
};

run();
