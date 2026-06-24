import { readFileSync, writeFileSync } from "fs";
import * as fsp from "node:fs/promises";
import path from "path";
// @ts-expect-error ts-missing-module
import tablemark from "json-to-markdown-table";
import * as utils from "./utils/index.js";

type PackageData = {
  Name: string;
  Stage: string | number;
  Primitives: string;
  Size: string;
  NPM: string;
  "Solid 2": string;
};

// oxlint-disable-next-line no-console
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
const allPackageNames: string[] = [];

(async () => {
  const modulesData = await utils.getModulesData();
  let utilsList: string[] = [];

  for (const module of modulesData) {
    if (module.primitive == null) continue;

    if (module.name === "utils") {
      utilsList = module.primitive.list;
      continue;
    }

    const packageName = `@solid-primitives/${module.name}`;
    allPackageNames.push(packageName);

    const data = {} as PackageData;

    data.Name = `[${module.name}](${githubURL}${module.name}#readme)`;
    // Detect the stage and build size/version only if needed
    if (data.Stage == "X" || data.Stage == 0) {
      data.Size = "";
      data.NPM = "";
    } else {
      let gzip = module.primitive?.gzip;
      if (gzip == null) {
        const bundlesize = await utils.getPackageBundlesize(module.name, {
          peerDependencies: module.peer_deps,
        });
        if (bundlesize != null) {
          gzip = bundlesize.gzip;
          const pkgPath = path.join(utils.PACKAGES_DIR, module.name, "package.json");
          const raw = await fsp.readFile(pkgPath, "utf8");
          const indent = raw.match(/^(\s+)"/m)?.[1] ?? "  ";
          const pkg = JSON.parse(raw);
          if (pkg.primitive) {
            pkg.primitive.gzip = gzip;
            await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, indent) + "\n");
          }
        }
      }
      if (gzip != null) {
        const [value, unit] = utils.formatBytes(gzip);
        data.Size = `[![SIZE](https://img.shields.io/badge/size-${value}_${unit}-blue?style=for-the-badge)](${bundlephobiaURL}${packageName})`;
      } else {
        data.Size = `[![SIZE](${sizeShield}${packageName}?style=for-the-badge&label=)](${bundlephobiaURL}${packageName})`;
      }
      data.NPM = `[![VERSION](${npmShield}${packageName}?style=for-the-badge&label=)](${npmURL}${packageName})`;
    }
    data.Stage = `[![STAGE](${stageShieldBaseURL}${module.primitive.stage}.json)](${stageShieldLink})`;
    const primLinks = module.primitive.list.map(
      prim => `[${prim}](${githubURL}${module.name}#${prim.replace(/ /g, "-").toLowerCase()})`,
    );
    data.Primitives =
      primLinks.length > 15
        ? `<details><summary>${primLinks.length} primitives</summary>${primLinks.join(", ")}</details>`
        : primLinks.join("<br />");
    data["Solid 2"] = /^[\^~]?2\./.test(module.solid_peer_version ?? "") ? "✓" : "";
    // Merge the package into the correct category
    const cat = categories[module.primitive.category];
    categories[module.primitive.category] = cat ? [...cat, data] : [data];
  }

  const pathToREADME = path.join(utils.ROOT_DIR, "README.md");
  let readme = readFileSync(pathToREADME).toString();

  // Update Primitives Table

  const table = Object.entries(categories).reduce((md, [category, items]) => {
    // Some MD jousting to get the table to render nicely
    // with consistent columns
    md += `|<h4>*${category}*</h4>|\n`;
    md += tablemark(items, ["Name", "Stage", "Primitives", "Size", "NPM", "Solid 2"])
      .replace("|Name|Stage|Primitives|Size|NPM|Solid 2|\n", "")
      .replace("|----|----|----|----|----|----|\n", "");
    return md;
  }, "|Name|Stage|Primitives|Size|NPM|Solid 2|\n|----|----|----|----|----|----|\n");

  readme = utils.insertTextBetweenComments(readme, table, "INSERT-PRIMITIVES-TABLE");

  // Update Utils Table

  const COLS = 4;
  const utilsGithubURL = `${githubURL}utils#`;
  const utilsRows: string[] = [];
  for (let i = 0; i < utilsList.length; i += COLS) {
    const cells = utilsList.slice(i, i + COLS).map(fn => `[${fn}](${utilsGithubURL}${fn.toLowerCase()})`);
    while (cells.length < COLS) cells.push("");
    utilsRows.push(`|${cells.join("|")}|`);
  }
  const utilsTable = [`|${"  |".repeat(COLS)}`, `|${"---|".repeat(COLS)}`, ...utilsRows].join("\n");
  readme = utils.insertTextBetweenComments(readme, utilsTable, "INSERT-UTILS-TABLE");

  // Update Combined Downloads Badge

  const combinedDownloadsBadge = `[![combined-downloads](https://img.shields.io/endpoint?style=for-the-badge&url=https://combined-npm-downloads.deno.dev/${allPackageNames.join(
    ",",
  )})](https://dash.deno.com/playground/combined-npm-downloads)`;

  readme = utils.insertTextBetweenComments(
    readme,
    combinedDownloadsBadge,
    "INSERT-NPM-DOWNLOADS-BADGE",
  );

  writeFileSync(pathToREADME, readme);
})();
