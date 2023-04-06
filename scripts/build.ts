import { build } from "tsup";
import { EntryOptions, defineConfig } from "tsup-preset-solid";
import path from "path";
import fs from "fs";

/*

Toggle additional entries as needed.

* we moved to just using isDev and isServer to determine the env, so we don't need to build multiple entries anymore.

// `--dev` will enable creating a separate development module entry.
// What goes in and out are decided by use of `isDev` or `process.env.PROD`.

// `--ssr` will enable building a server-side entry (for use with SSR frameworks).
// What goes in and out are decided by use of `isServer`.

// `--jsx` will enable building a `solid` entry with preserved JSX.

`--write` or `-w` will write the exports configuration to package.json instead of to the console.
The exports configuration is taken from the solid-js package.json.

*/

// const ssrEntry = process.argv.includes("--ssr");
// const devEntry = process.argv.includes("--dev");
// const jsxEntry = process.argv.includes("--jsx");
const nodePlatform = process.argv.includes("--node");
const writeExports = process.argv.includes("--write") || process.argv.includes("-w");
const printExports = !writeExports;
const cwd = process.cwd();

const customOptions: Record<string, EntryOptions | EntryOptions[]> = {
  "controlled-props": {
    entry: "src/index.tsx",
  },
  utils: [
    {
      entry: "src/index.ts",
    },
    {
      name: "immutable",
      entry: "src/immutable/index.ts",
    },
  ],
};
(async () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
  const packageName = packageJson.name!.replace("@solid-primitives/", "");

  let options = defineConfig(
    customOptions[packageName] ?? {
      entry: `src/index.ts`,
      // devEntry: devEntry,
      // serverEntry: ssrEntry,
    },
    {
      cjs: true,
      writePackageJson: writeExports,
      printInstructions: printExports,
      // dropConsole: true,
      tsupOptions(o) {
        if (nodePlatform) {
          // by default, the platform is "browser" - it'll prevent using node builtins
          o.platform = "node";
        }
        return o;
      },
    },
  );

  if (typeof options === "function") {
    options = await options({});
  }

  if (!Array.isArray(options)) {
    options = [options];
  }

  options.forEach(build);
})();
