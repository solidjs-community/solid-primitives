import { readFileSync, writeFile, writeFileSync } from "fs";
import { TUpdateSiteGlobal } from ".";
import { formatBytes, r, regexGlobalCaptureGroup } from "../utils";
import checkSizeOfPackage from "./checkSizeOfPackage";

const item: {
  name: string;
  category: string;
  description: string;
  primitives: string[];
}[] = [];

export const buildJSONCategory = async ({
  pkg,
  name,
  globalState,
}: {
  pkg: any;
  name: string;
  globalState: TUpdateSiteGlobal;
}) => {
  const pkgJSON = JSON.parse(JSON.stringify(pkg));
  const { description } = pkgJSON as { description: string };
  const { list, category, stage } = pkgJSON.primitive as {
    list: string[];
    category: string;
    stage: number;
  };

  pkgJSON.list = list;

  if (list.length === 1 && list[0]!.match(/list of/gi)) {
    // get primitives from src directory
    const dir = r(`../packages/${name}/src/index.ts`);
    const indexFile = readFileSync(dir, "utf-8");

    const resultStar = regexGlobalCaptureGroup(indexFile, /export\s+\*\sfrom\s+"[^"]+\/(\w+)"/g);

    let concatFile = indexFile;

    const capturePrimitives = (fileStr: string) => {
      const resultExport = regexGlobalCaptureGroup(
        fileStr,
        /export\s+(?:default|const|function|let)\s(\w+)/g
      );
      if (resultExport) {
        pkgJSON.list = resultExport;
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

  const primitives = [...new Set(pkgJSON.list)] as string[];

  item.push({
    name,
    category,
    description,
    primitives
  });

  if (list.length === 1 && list[0]!.match(/list of/gi)) {
    for (let primitive of primitives) {
      const result = await checkSizeOfPackage({
        type: "export",
        packageName: name,
        primitiveName: primitive,
        excludeGzipHeadersAndMetadataSize: true
      });
      const minifiedSize = formatBytes(result.minifiedSize).string;
      const gzippedSize = formatBytes(result.gzippedSize).string;

      globalState.primitives[primitive] = {
        packageName: name,
        gzippedSize,
        minifiedSize
      };
    }
  }
};

export const writeJSONFile = () => {
  const pathToJSONFile = r("../site/src/primitives.json");
  writeFile(pathToJSONFile, JSON.stringify(item), err => {
    if (err) console.log(err);
  });
};
