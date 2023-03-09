import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { r } from "../utils";
import { buildAndWriteHomeSections } from "./build-html-home-sections";
import { buildCategory, writeHTMLTableFile } from "./build-html-table";
import { buildJSONCategory, writeJSONFile } from "./build-json-category";
import { buildPage, writePages } from "./build-pages";

export type PackageData = {
  Name: string;
  Stage: string | number;
  Size: string;
  NPM: string;
  Primitives: string;
};

export type PackageJSONData = {
  name: string;
  description: string;
  primitive: {
    name?: string;
    list: string[];
    category: string;
    stage: number;
  };
};

export type TSize = {
  gzipped: {
    string: string;
    number: number;
    unit: string;
  };
  minified: {
    string: string;
    number: number;
    unit: string;
  };
};

export type TUpdateSiteGlobal = {
  primitives: {
    [key: string]: {
      packageName: string;
      size: TSize;
    };
  };
  packageName: {
    [key: string]: {
      name: string;
      size: TSize;
    };
  };
};
const globalState: TUpdateSiteGlobal = {
  packageName: {},
  primitives: {},
};

console.log("updateSite", "Updating site");

const generatedDir = r(`../site/src/_generated`);
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir);
}
const packageFiles = readdirSync(r(`../packages/`));
const run = async () => {
  for (const name of packageFiles) {
    const dir = r(`../packages/${name}/package.json`);
    if (!existsSync(dir)) return;
    const pkg = JSON.parse(readFileSync(dir, "utf8")) as PackageJSONData;

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

    await buildCategory({ name, pkg, globalState });
    await buildJSONCategory({ name, pkg, globalState });
    await buildPage({ name, pkg, globalState: globalState });
  }

  writeJSONFile();
  writeHTMLTableFile();
  writePages();
};

run();
buildAndWriteHomeSections();
