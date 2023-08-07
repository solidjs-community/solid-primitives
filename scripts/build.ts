import { build } from "tsup";
import { EntryOptions } from "tsup-preset-solid";
import * as preset from "tsup-preset-solid";
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

export const CI =
  process.env["CI"] === "true" ||
  process.env["CI"] === '"1"' ||
  process.env["GITHUB_ACTIONS"] === "true" ||
  process.env["GITHUB_ACTIONS"] === '"1"' ||
  !!process.env["TURBO_HASH"];

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
  const package_json = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
  const package_name = package_json.name!.replace("@solid-primitives/", "");

  const parsed_options = preset.parsePresetOptions({
    entries: customOptions[package_name] ?? { entry: `src/index.ts` },
    cjs: true,
  });

  if (!CI) {
    const package_fields = preset.generatePackageExports(parsed_options);

    if (writeExports) {
      preset.writePackageJson(package_fields);
    } else {
      // eslint-disable-next-line no-console
      console.log("Package json exports:", JSON.stringify(package_fields, null, 2));
    }
  }

  const tsup_options = preset.generateTsupOptions(parsed_options);

  if (nodePlatform) {
    for (const option of tsup_options) {
      // by default, the platform is "browser" - it'll prevent using node builtins
      option.platform = "node";
    }
  }

  tsup_options.forEach(build);
})();
