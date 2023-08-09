/* eslint-disable no-console */
import path from "path";
import { copy, readFile, writeFile, pathExists } from "fs-extra";
import { checkValidPackageName } from "./utils/index.js";

const name = process.argv.pop();

if (!name || !checkValidPackageName(name))
  throw new Error(`Incorrect package name argument: "${name}"`);

const templateSrc = path.resolve(__dirname, "../template");
const destSrc = path.resolve(__dirname, "../packages", name);
const pkgPath = path.join(destSrc, "package.json");
const readmePath = path.join(destSrc, "README.md");

(async () => {
  const alreadyExists = await pathExists(destSrc);
  if (alreadyExists) throw `Package ${name} already exists.`;

  try {
    // copy /template -> /packages/{name}
    await copy(templateSrc, destSrc);

    // replace "template-primitive" -> {name} in package.json
    readFile(pkgPath, "utf8")
      .then(pkg => {
        pkg = pkg.replace(/template-primitive/g, name);
        writeFile(pkgPath, pkg);
      })
      .catch(error => {
        console.log("replace package.json failed");
        console.error(error);
      });

    // replace "template-primitive" -> {name} in README.md
    readFile(readmePath, "utf8")
      .then(readme => {
        readme = readme.replace(/template-primitive/g, name);
        writeFile(readmePath, readme);
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
