import * as tsup from "tsup";
import * as preset from "tsup-preset-solid";
import path from "path";

/*

Toggle additional entries as needed.

`--write` or `-w` will write the exports configuration to package.json instead of to the console.
The exports configuration is taken from the solid-js package.json.

*/

const { env, argv } = process;
const cwd = process.cwd();
const write_exports = argv.includes("--write") || argv.includes("-w");

export const CI =
  env["CI"] === "true" ||
  env["CI"] === '"1"' ||
  env["GITHUB_ACTIONS"] === "true" ||
  env["GITHUB_ACTIONS"] === '"1"' ||
  !!env["TURBO_HASH"];

const custom_entries: Record<string, preset.EntryOptions | preset.EntryOptions[]> = {
  "controlled-props": {
    entry: "src/index.tsx",
  },
  "virtualized-list": {
    entry: "src/index.tsx",
  },
  /*filesystem: [
    {
      entry: "src/index.ts",
    },
    {
      entry: "src/tauri.ts",
      name: "tauri",
    },
  ],*/
  storage: [
    {
      entry: "src/index.ts",
    },
    {
      entry: "src/tauri.ts",
      name: "tauri",
    },
  ],
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

const custom_tsup_options: Record<string, (options: tsup.Options) => void> = {
  filesystem(options) {
    // by default, the platform is "browser" - it'll prevent using node builtins
    options.platform = "node";
  },
};

const package_name = path.basename(cwd);

const parsed_options = preset.parsePresetOptions({
  entries: custom_entries[package_name] ?? { entry: `src/index.ts` },
  cjs: true,
});

if (!CI) {
  const package_fields = preset.generatePackageExports(parsed_options);

  if (write_exports) {
    preset.writePackageJson(package_fields);
  } else {
    // eslint-disable-next-line no-console
    console.log("Package json exports:", JSON.stringify(package_fields, null, 2));
  }
}

const tsup_options = preset.generateTsupOptions(parsed_options);

const modifyOptions = custom_tsup_options[package_name];
if (modifyOptions) for (const option of tsup_options) modifyOptions(option);

tsup_options.forEach(tsup.build);
