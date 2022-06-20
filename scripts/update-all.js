const { readdir, readFile, writeFile } = require("fs/promises");
const { join } = require("path");
const pathTo = (...path) => join(__dirname, ...path);

const excluded = [
  "all",
  "analytics",
  "composites",
  "debounce",
  "gestures",
  "lazy-memo",
  "throttle",
  "utils",
  "visibility-observer"
];

(async () => {
  const packages = (
    await readdir(pathTo("../packages")).catch(() => {
      throw new Error("could not read packages");
    })
  )?.filter(pkg => !excluded.includes(pkg));

  const allPackageJson = JSON.parse(await readFile(pathTo("../packages/all/package.json")));
  // overwrite dependencies
  allPackageJson.dependencies = {};
  indexTsx = [];
  serverTsx = [];
  for (let i = 0; i < packages.length; i++) {
    // set package versions
    const package = packages[i];
    const packagePath = pathTo(`../packages/${package}/package.json`);
    const packageJson = JSON.parse(await readFile(packagePath));
    allPackageJson.dependencies[packageJson.name] = `^${packageJson.version}`;
    // add exports to index.tsx
    indexTsx.push(
      `export *${package === "signal-builder" ? " as sb" : ""} from "${packageJson.name}";`
    );
    // add exports to server.tsx
    if (typeof packageJson.exports?.node === "object") {
      serverTsx.push(
        `export *${package === "signal-builder" ? " as sb" : ""} from "${packageJson.name}";`
      );
    }
  }
  // add empty line at the end of sources
  indexTsx.push("");
  serverTsx.push("");
  await writeFile(
    pathTo("../packages/all/package.json"),
    JSON.stringify(allPackageJson, undefined, 2)
  );
  await writeFile(pathTo("../packages/all/src/index.tsx"), indexTsx.join("\n"));
  await writeFile(pathTo("../packages/all/src/server.tsx"), indexTsx.join("\n"));
  console.log('updated "all" package');
})();
