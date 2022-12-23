import { readdirSync, existsSync, readFileSync, writeFileSync } from "fs";
// @ts-expect-error ts-missing-module
import tablemark from "json-to-markdown-table";
import { r } from "../utils";
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
  primitive: {
    name?: string;
    list: string[];
    category: string;
    stage: number;
  };
};

console.log("updateSite", "Updating site");

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
        `directory name (${name}) and name in package info ${pkg.primitive.name} do not match`
      );
      continue;
    }

    buildCategory({ name, pkg });
    buildJSONCategory({ name, pkg });
    await buildPage({ name, pkg });
  }

  writeJSONFile();
  writeHTMLTableFile();
  writePages();
};

run();
