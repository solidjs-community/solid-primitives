import { readdirSync, existsSync, readFileSync, writeFileSync } from "fs";
// @ts-expect-error ts-missing-module
import tablemark from "json-to-markdown-table";
import { insertTextBetweenComments, r } from "./utils";

type PackageData = {
  Name: string;
  Stage: string | number;
  Size: string;
  NPM: string;
  Primitives: string;
};

console.log("updateReadme", "Updating README documentation");

const githubURL = "https://github.com/solidjs-community/solid-primitives/tree/main/packages/";
const sizeShield = "https://img.shields.io/bundlephobia/minzip/";
const bundlephobiaURL = "https://bundlephobia.com/package/";
const npmShield = "https://img.shields.io/npm/v/";
const npmURL = "https://www.npmjs.com/package/";
const stageShieldBaseURL =
  "https://img.shields.io/endpoint?style=for-the-badge&label=&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-"; // add "<stage>.json" after
const stageShieldLink =
  "https://github.com/solidjs-community/solid-primitives/blob/main/CONTRIBUTING.md#contribution-process";

const categories: Record<string, PackageData[]> = {};
const rootDependencies: string[] = [];

readdirSync(r(`../packages/`)).forEach(name => {
  const dir = r(`../packages/${name}/package.json`);
  if (!existsSync(dir)) return;
  const pkg = JSON.parse(readFileSync(dir, "utf8"));

  const { dependencies } = pkg;

  if (!dependencies || Object.keys(dependencies).every(d => !d.includes("@solid-primitives/"))) {
    rootDependencies.push(`@solid-primitives/${name}`);
  }

  if (!pkg.primitive)
    return console.warn(`package ${name} doesn't have primitive field in package.json`);
  if (pkg.primitive.name !== name)
    return console.warn(
      `directory name (${name}) and name in package info ${pkg.primitive.name} do not match`,
    );

  const { list, category, stage } = pkg.primitive as {
    list: string[];
    category: string;
    stage: number;
  };

  const data = {} as PackageData;

  data.Name = `[${name}](${githubURL}${name}#readme)`;
  // Detect the stage and build size/version only if needed
  if (data.Stage == "X" || data.Stage == 0) {
    data.Size = "";
    data.NPM = "";
  } else {
    data.Size = `[![SIZE](${sizeShield}${pkg.name}?style=for-the-badge&label=)](${bundlephobiaURL}${pkg.name})`;
    data.NPM = `[![VERSION](${npmShield}${pkg.name}?style=for-the-badge&label=)](${npmURL}${pkg.name})`;
  }
  data.Stage = `[![STAGE](${stageShieldBaseURL}${stage ?? "2"}.json)](${stageShieldLink})`;
  data.Primitives = list
    .map(prim => `[${prim}](${githubURL}${name}#${prim.replace(/ /g, "-").toLowerCase()})`)
    .join("<br />");
  // Merge the package into the correct category
  let cat = category || "Misc";
  categories[cat] = Array.isArray(categories[cat]) ? [...categories[cat], data] : [data];
});

const pathToREADME = r("../README.md");
let readme = readFileSync(pathToREADME).toString();

// Update Primitives Table

const table = Object.entries(categories).reduce((md, [category, items]) => {
  // Some MD jousting to get the table to render nicely
  // with consistent columns
  md += `|<h4>*${category}*</h4>|\n`;
  md += tablemark(items, ["Name", "Stage", "Primitives", "Size", "NPM"])
    .replace("|Name|Stage|Primitives|Size|NPM|\n", "")
    .replace("|----|----|----|----|----|\n", "");
  return md;
}, "|Name|Stage|Primitives|Size|NPM|\n|----|----|----|----|----|\n");

readme = insertTextBetweenComments(readme, table, "INSERT-PRIMITIVES-TABLE");

// Update Combined Downloads Badge

const combinedDownloadsBadge = `[![combined-downloads](https://img.shields.io/endpoint?style=for-the-badge&url=https://combined-npm-downloads.deno.dev/${rootDependencies.join(
  ",",
)})](https://dash.deno.com/playground/combined-npm-downloads)`;

readme = insertTextBetweenComments(readme, combinedDownloadsBadge, "INSERT-NPM-DOWNLOADS-BADGE");

writeFileSync(pathToREADME, readme);
