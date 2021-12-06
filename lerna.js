const { loadPackages, iter } = require("lerna-script");
const fs = require("fs").promises;
const path = require("path");

// ------------------------------------------------------------
// Generates a new README with updates primitive details
// ------------------------------------------------------------
async function updateReadme(log) {
  log.info("updateReadme", "Updating README documentation");
  const markdownMagic = require("markdown-magic");
  const tablemark = require("json-to-markdown-table");
  const githubURL = "https://github.com/davedbase/solid-primitives/tree/main/packages/";
  const sizeShield = "https://img.shields.io/bundlephobia/minzip/";
  const bundlephobiaURL = "https://bundlephobia.com/package/";
  const npmShield = "https://img.shields.io/npm/v/";
  const npmURL = "https://www.npmjs.com/package/";
  let categories = {};
  // Retrieve packages managed by Lerna
  await iter.forEach(await loadPackages())(async lernaPackage => {
    const pkgData = await fs.readFile(`${lernaPackage.location}/package.json`, "utf8");
    const package = JSON.parse(pkgData);
    if (!package.primitive) {
      return;
    }
    const { name, list, category, stage } = package.primitive;
    if (name) {
      let data = {};
      data.Name = `[${name}](${githubURL}${name})`;
      // Detect the stage and build size/version only if needed
      if (data.Stage == "X" || data.Stage == 0) {
        data.Size = "";
        data.NPM = "";
      } else {
        data.Size = `[![SIZE](${sizeShield}${lernaPackage.name}?style=for-the-badge&label=)](${bundlephobiaURL}${lernaPackage.name})`;
        data.NPM = `[![VERSION](${npmShield}${lernaPackage.name}?style=for-the-badge&label=)](${npmURL}${lernaPackage.name})`;
      }
      // data.Stage = stage ? stage.toString() : "2";
      data.Stage = `[![STAGE](https://img.shields.io/endpoint?style=for-the-badge&label=&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fstage-badges%2Fassets%2Fbadges%2Fstage-${
        stage ? stage.toString() : "2"
      }.json)](https://github.com/davedbase/solid-primitives#contribution-process)`;
      data.Primitives = list.join("<br />");
      // Merge the package into the correct category
      let cat = category || "Misc";
      categories[cat] = Array.isArray(categories[cat]) ? [...categories[cat], data] : [data];
    }
  });
  // Generate and insert collected package data into Markdown
  return new Promise(resolve => {
    markdownMagic(
      path.join(__dirname, "README.md"),
      {
        transforms: {
          GENERATE_PRIMITIVES_TABLE: () => {
            return Object.entries(categories).reduce((md, [category, items]) => {
              // Some MD jousting to get the table to render nicely
              // with consistent columns
              md += `|<br />*${category}*<br /><br />|\n`;
              md += tablemark(items, ["Name", "Stage", "Primitives", "Size", "NPM"])
                .replace("|Name|Stage|Primitives|Size|NPM|\n", "")
                .replace("|----|----|----|----|----|\n", "");
              return md;
            }, "|Name|Stage|Primitives|Size|NPM|\n|----|----|----|----|----|\n");
          }
        }
      },
      resolve
    );
  });
}

// ------------------------------------------------------------
// Create a new primitive folder based on the default template
// ------------------------------------------------------------
async function createPrimitive(log) {
  const shell = require("child_process").execSync;
  const { join } = require("path");
  const packageName = process.argv.pop();
  const src = join(__dirname, "template");
  const dest = join(__dirname, "packages", packageName);
  shell(`mkdir -p ${dest}`);
  shell(`cp -r ${src}/* ${dest}`);
}

module.exports.updateReadme = updateReadme;
module.exports.createPrimitive = createPrimitive;
