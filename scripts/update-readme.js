const { readdirSync, existsSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const markdownMagic = require("markdown-magic");
const tablemark = require("json-to-markdown-table");

const pathTo = (...path) => join(__dirname, ...path);

console.log("updateReadme", "Updating README documentation");

const githubURL = "https://github.com/solidjs-community/solid-primitives/tree/main/packages/";
const sizeShield = "https://img.shields.io/bundlephobia/minzip/";
const bundlephobiaURL = "https://bundlephobia.com/package/";
const npmShield = "https://img.shields.io/npm/v/";
const npmURL = "https://www.npmjs.com/package/";
const stageShieldBaseURL =
  "https://img.shields.io/endpoint?style=for-the-badge&label=&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-"; // add "<stage>.json" after
const stageShieldLink =
  "https://github.com/solidjs-community/solid-primitives#contribution-process";

const categories = {};
const rootDependencies = [];

readdirSync(pathTo(`../packages/`)).forEach(name => {
  const dir = pathTo(`../packages/${name}/package.json`);
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
      `directory name (${name}) and name in package info ${pkg.primitive.name} do not match`
    );

  const { list, category, stage } = pkg.primitive;

  const data = {};
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
    .map(prim => `[${prim}](${githubURL}${name}#${prim.replace(/ /g, "-")})`)
    .join("<br />");
  // Merge the package into the correct category
  let cat = category || "Misc";
  categories[cat] = Array.isArray(categories[cat]) ? [...categories[cat], data] : [data];
});

const pathToREADME = pathTo("../README.md");

(async () => {
  await markdownMagic(pathToREADME, {
    transforms: {
      GENERATE_PRIMITIVES_TABLE: () => {
        return Object.entries(categories).reduce((md, [category, items]) => {
          // Some MD jousting to get the table to render nicely
          // with consistent columns
          md += `|<h4>*${category}*</h4>|\n`;
          md += tablemark(items, ["Name", "Stage", "Primitives", "Size", "NPM"])
            .replace("|Name|Stage|Primitives|Size|NPM|\n", "")
            .replace("|----|----|----|----|----|\n", "");
          return md;
        }, "|Name|Stage|Primitives|Size|NPM|\n|----|----|----|----|----|\n");
      }
    }
  });

  const readme = readFileSync(pathToREADME).toString();

  const exec =
    /(<!-- INSERT-NPM-DOWNLOADS-BADGE:START -->)[.\n\r\S]*(<!-- INSERT-NPM-DOWNLOADS-BADGE:END -->)/g.exec(
      readme
    );
  if (!exec) return console.log("Couldn't find INSERT-NPM-DOWNLOADS-BADGE tag in README.md");

  const start = exec.index + exec[1].length;
  const end = exec.index + exec[0].length - exec[2].length;

  const combinedDownloadsBadge = `[![combined-downloads](https://img.shields.io/endpoint?style=for-the-badge&url=https://runkit.io/thetarnav/combined-weekly-npm-downloads/1.0.3/${rootDependencies.join(
    ","
  )})](https://runkit.com/thetarnav/combined-weekly-npm-downloads)`;

  const newReadme =
    readme.slice(0, start) + "\r\n" + combinedDownloadsBadge + "\r\n" + readme.slice(end);

  writeFileSync(pathToREADME, newReadme);
})();
