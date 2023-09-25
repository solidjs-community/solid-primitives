/* eslint-disable no-console */
import fse from "fs-extra";
import fsp from "fs/promises";
import path from "path";
import url from "url";
import { checkValidPackageName } from "./utils/index.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const name = process.argv.pop();

if (!name || !checkValidPackageName(name))
  throw new Error(`Incorrect package name argument: "${name}"`);

const templateSrc = path.resolve(dirname, "../template");
const destSrc = path.resolve(dirname, "../packages", name);
const pkgPath = path.join(destSrc, "package.json");
const readmePath = path.join(destSrc, "README.md");

(async () => {
  const alreadyExists = await fse.pathExists(destSrc);
  if (alreadyExists) throw `Package ${name} already exists.`;

  try {
    // copy /template -> /packages/{name}
    await fse.copy(templateSrc, destSrc);

    // replace "template-primitive" -> {name} in package.json
    fsp
      .readFile(pkgPath, "utf8")
      .then(pkg => {
        pkg = pkg.replace(/template-primitive/g, name);
        fsp.writeFile(pkgPath, pkg);
      })
      .catch(error => {
        console.log("replace package.json failed");
        console.error(error);
      });

    // replace "template-primitive" -> {name} in README.md
    fsp
      .readFile(readmePath, "utf8")
      .then(readme => {
        readme = readme.replace(/template-primitive/g, name);
        fsp.writeFile(readmePath, readme);
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
