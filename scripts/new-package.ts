/* eslint-disable no-console */
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import * as utils from "./utils/index.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const name = process.argv.pop();

if (!name || !utils.checkValidPackageName(name))
  throw new Error(`Incorrect package name argument: "${name}"`);

const template_path = path.resolve(dirname, "../template");
const dst_path      = path.resolve(dirname, "../packages", name);
const pkg_path      = path.join(dst_path, "package.json");
const readme_path   = path.join(dst_path, "README.md");

(async () => {
  const alreadyExists = await utils.pathExists(dst_path);
  if (alreadyExists) throw `Package ${name} already exists.`;

  try {
    // copy /template -> /packages/{name}
    await utils.copyDirectory(template_path, dst_path);

    // replace "template-primitive" -> {name} in package.json
    fsp
      .readFile(pkg_path, "utf8")
      .then(pkg => {
        pkg = pkg.replace(/template-primitive/g, name);
        fsp.writeFile(pkg_path, pkg);
      })
      .catch(error => {
        console.log("replace package.json failed");
        console.error(error);
      });

    // replace "template-primitive" -> {name} in README.md
    fsp
      .readFile(readme_path, "utf8")
      .then(readme => {
        readme = readme.replace(/template-primitive/g, name);
        fsp.writeFile(readme_path, readme);
      })
      .catch(error => {
        console.log("replace README.md failed");
        console.error(error);
      });
  } catch (error) {
    console.log("Copying failed");
    console.error(error);
  }
})();
