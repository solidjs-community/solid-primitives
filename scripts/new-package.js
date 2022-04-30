const { join } = require("path");
const { copy, readFile, writeFile, pathExists } = require("fs-extra");
const pathTo = (...path) => join(__dirname, ...path);
const name = process.argv.pop();

const templateSrc = pathTo("../template");
const destSrc = pathTo("../packages", name);
const pkgPath = join(destSrc, "package.json");
const readmePath = join(destSrc, "README.md");

(async () => {
  const alreadyExists = await pathExists(destSrc);
  if (alreadyExists) return console.error(`Package ${name} already exists.`);

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
