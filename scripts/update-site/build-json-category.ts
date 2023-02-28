import { readFileSync, writeFile, writeFileSync } from "fs";
import { TUpdateSiteGlobal } from ".";
import { r, regexGlobalCaptureGroup } from "../utils";

const item: {
  name: string;
  category: string;
  description: string;
  primitives: string[];
}[] = [];

export const buildJSONCategory = ({
  pkg,
  name,
  global
}: {
  pkg: any;
  name: string;
  global: TUpdateSiteGlobal;
}) => {
  const pkgJSON = JSON.parse(JSON.stringify(pkg));
  const { description } = pkgJSON as { description: string };
  const { list, category, stage } = pkgJSON.primitive as {
    list: string[];
    category: string;
    stage: number;
  };

  pkgJSON.list = list;

  if (list.length === 1 && list[0].match(/list of/gi)) {
    // get primitives from src directory
    const dir = r(`../packages/${name}/src/index.ts`);
    const indexFile = readFileSync(dir, "utf-8");

    // console.log("log file", indexFile.slice(1, 100));

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

  item.push({
    name,
    category,
    description,
    primitives: [...new Set(pkgJSON.list)] as string[]
  });
};

export const writeJSONFile = () => {
  const pathToJSONFile = r("../site/src/primitives.json");
  writeFile(pathToJSONFile, JSON.stringify(item), err => {
    if (err) console.log(err);
  });
};
