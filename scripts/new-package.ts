import { join } from "path";
import { copy, readFile, writeFile, pathExists } from "fs-extra";
import { r } from "./utils";

const name = process.argv.pop();

if (!name || !/[a-z0-9\-]+/.test(name) || name.match(/[a-z0-9\-]+/)![0].length !== name.length)
  throw `Incorrect package name argument: ${name}`;

const templateSrc = r("../template");
const destSrc = r("../packages", name);
const pkgPath = join(destSrc, "package.json");
const readmePath = join(destSrc, "README.md");

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
