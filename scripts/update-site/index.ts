import { existsSync, mkdirSync } from "fs";
import { r } from "../utils";
import { buildAndWriteHomeSections } from "./build-html-home-sections";
import { buildCategory, writeHTMLTableFile } from "./build-html-table";
import { buildJSONCategory, writeJSONFile } from "./build-json-category";
import { getPackageData } from "./get-package-data";
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
  version: string;
  primitive: {
    name: string;
    list: string[];
    category: string;
    stage: number;
  };
  peerDependencies: { [key: string]: string };
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

export type TPackageData = {
  name: string;
  description: string;
  size: TSize;
  primitive: {
    name: string;
    list: {
      name: string;
      size: TSize;
    }[];
    isListCollapsed: boolean;
    collapsedContent?: string;
    category: string;
    stage: number;
  };
  version: string;
  tags: string[];
  peerDependencies: { [key: string]: string };
};

console.log("updateSite", "Updating site");

const generatedDir = r(`../site/src/_generated`);
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir);
}

const run = async () => {
  const packageData = await getPackageData();

  for (const packageItem of packageData) {
    const { primitive } = packageItem;

    await buildCategory({ name: primitive.name!, pkg: packageItem });
    await buildJSONCategory({ name: primitive.name!, pkg: packageItem });
    await buildPage({ name: primitive.name!, pkg: packageItem });
  }

  writeJSONFile();
  writeHTMLTableFile();
  writePages();
};

run();
buildAndWriteHomeSections();
