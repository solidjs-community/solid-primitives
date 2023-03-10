import { readFileSync, writeFile, writeFileSync } from "fs";
import { PackageJSONData, TSize, TUpdateSiteGlobal } from ".";
import { formatBytes, r, regexGlobalCaptureGroup } from "../utils";
import checkSizeOfPackage from "../checkSizeOfPackage";
import { primitiveTags } from "./tags";

const item: {
  name: string;
  category: string;
  description: string;
  primitives: {
    name: string;
    size: TSize;
  }[];
  tags: string[];
}[] = [];

export const buildJSONCategory = async ({
  pkg,
  name,
  globalState,
}: {
  pkg: PackageJSONData;
  name: string;
  globalState: TUpdateSiteGlobal;
}) => {
  const pkgJSON = pkg;
  const { description } = pkgJSON;
  const { list, category, stage } = pkgJSON.primitive;
  let expandedList: string[] = list;

  if (list.length === 1 && list[0]!.match(/list of/gi)) {
    // get primitives from src directory
    const dir = r(`../packages/${name}/src/index.ts`);
    const indexFile = readFileSync(dir, "utf-8");

    const resultStar = regexGlobalCaptureGroup(indexFile, /export\s+\*\sfrom\s+"[^"]+\/(\w+)"/g);

    let concatFile = indexFile;

    const capturePrimitives = (fileStr: string) => {
      const resultExport = regexGlobalCaptureGroup(
        fileStr,
        /export\s+(?:default|const|function|let)\s(\w+)/g,
      );
      if (resultExport) {
        expandedList = resultExport;
      }
    };

    if (resultStar) {
      resultStar.forEach(item => {
        const dir = r(`../packages/${name}/src/${item}.ts`);
        const indexFile = readFileSync(dir, "utf-8");
        concatFile += indexFile;
      });
    }

    capturePrimitives(concatFile);
  }

  const _primitives = [...new Set(expandedList)] as string[];

  if (list.length === 1 && list[0]!.match(/list of/gi)) {
    for (let primitive of _primitives) {
      const result = await checkSizeOfPackage({
        type: "export",
        packageName: name,
        primitiveName: primitive,
        excludeGzipHeadersAndMetadataSize: true,
      });
      const minified = formatBytes(result.minifiedSize);
      const gzipped = formatBytes(result.gzippedSize);

      globalState.primitives[primitive] = {
        packageName: name,
        size: {
          gzipped,
          minified,
        },
      };
    }
  }

  const primitives = _primitives.map(item => {
    const { size } = globalState.primitives[item]!;
    return {
      name: item,
      size: {
        gzipped: size.gzipped.string,
        minified: size.minified.string,
      },
    } as any;
  });

  const tags = primitiveTags.find(item => item.name === name)?.tags || [];

  item.push({
    name,
    category,
    description,
    primitives,
    tags,
  });
};

export const writeJSONFile = () => {
  const pathToJSONFile = r("../site/src/_generated/primitives.json");
  writeFile(pathToJSONFile, JSON.stringify(item), err => {
    if (err) console.log(err);
  });
};
