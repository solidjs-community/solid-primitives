import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { PackageJSONData, TPackageData } from ".";
import checkSizeOfBundle from "../checkSizeOfBundle";
import { formatBytes, r, regexGlobalCaptureGroup } from "../utils";
import { primitiveTags } from "./tags";

console.log("get package data", "Getting packages' package.json");

const generatedDir = r(`../site/src/_generated`);
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir);
}
const packageCollapsedListOfPrimitives = ["signal-builders", "platform"];
const maximumPrimitivesCount = 30;

const packageNameCategoryMap = [
  {
    package: "utils",
    category: "Support / Helper",
    isListCollapsed: true,
    collapsedContent: "List of utilities",
  },
];

const packageFiles = readdirSync(r(`../packages/`));
export const getPackageData = async () => {
  const packageData: TPackageData[] = [];
  for (const name of packageFiles) {
    const packageJsonPath = r(`../packages/${name}/package.json`);
    if (!existsSync(packageJsonPath)) continue;
    const pkgFile = readFileSync(packageJsonPath, "utf8");
    const pkg = JSON.parse(pkgFile) as PackageJSONData;

    if (!pkg.primitive) {
      console.warn(`package ${name} doesn't have primitive field in package.json`);
      // continue;
      const packageName = pkg.name.replace(/^.+\//, "");
      const foundPackage = packageNameCategoryMap.find(pkg => pkg.package === packageName);
      const category = foundPackage?.category || "Misc";
      const isListCollapsed = !!foundPackage?.isListCollapsed;
      const collapsedContent = foundPackage?.collapsedContent;
      const list = (isListCollapsed ? [collapsedContent!] : []) as any;

      const primitive = {
        name: packageName,
        category,
        list,
        stage: 0,
        isListCollapsed,
        collapsedContent,
      } as TPackageData["primitive"];

      // @ts-ignore
      pkg.primitive = primitive;
    }

    const collapsedContent = pkg.primitive?.list[0];
    const isPrimitiveListCollapsed = !!collapsedContent?.match(/list of/gi);

    if (pkg.primitive.name !== name) {
      console.warn(
        `directory name (${name}) and name in package info ${pkg.primitive.name} do not match`,
      );
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
        /export\s+(?:default(?:\s+function)?|async\s+)?(?:const|function\*?|let|class)?\s+(\w+)/g,
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

    const _primitives = await Promise.all(
      [...new Set(expandedList)]
        // remove CONSTANTS
        .filter(item => item !== item?.toUpperCase())
        .sort()
        .map(async (primitive, _, self) => {
          const type = self.length > 1 ? "export" : "package";
          const result = await checkSizeOfBundle({
            type,
            packageName: pkg.primitive.name!,
            exportName: primitive,
            excludeGzipHeadersAndMetadataSize: true,
          });
          const minified = formatBytes(result.minifiedSize);
          const gzipped = formatBytes(result.gzippedSize);

          return {
            name: primitive,
            size: {
              minified,
              gzipped,
            },
          };
        }),
    );

    if (
      _primitives.length > maximumPrimitivesCount &&
      !isPrimitiveListCollapsed &&
      !packageCollapsedListOfPrimitives.includes(name)
    ) {
      console.warn(
        `package ${name} has more than ${maximumPrimitivesCount} primitives, author should replace primitive.list in package.json with array with one item with string value of "List of [item-type]"`,
      );
    }

    const result = await checkSizeOfBundle({
      type: "package",
      packageName: pkg.primitive.name,
      excludeGzipHeadersAndMetadataSize: true,
    });
    const minified = formatBytes(result.minifiedSize);
    const gzipped = formatBytes(result.gzippedSize);
    const tags = primitiveTags.find(item => item.name === name)?.tags || [];

    packageData.push({
      ...pkg,
      size: {
        minified,
        gzipped,
      },
      primitive: {
        ...pkg.primitive,
        isListCollapsed: isPrimitiveListCollapsed,
        collapsedContent,
        list: _primitives,
      },
      tags,
    });
  }

  return packageData;
};
