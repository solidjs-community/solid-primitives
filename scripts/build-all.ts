import * as tsup from "tsup";
import * as preset from "tsup-preset-solid";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import * as utils from "./utils/index.js";

const custom_entries: Record<string, preset.EntryOptions | preset.EntryOptions[]> = {
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

console.log(os.cpus().length);

const modules_data = await utils.getModulesData();

for (const module_data of modules_data) {
  const module_path = path.join(utils.PACKAGES_DIR, module_data.name);

  const parsed = preset.parsePresetOptions({
    entries: custom_entries[module_data.name] ?? { entry: `src/index.ts` },
    cjs: true,
  });

  const tsup_options_list = preset.generateTsupOptions(parsed, { base_dir: module_path });

  for (const tsup_options of tsup_options_list) {
    // tsup.build(tsup_options);
  }
}

// const package_json = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
// const package_name = package_json.name!.replace("@solid-primitives/", "");

// const parsed_options = preset.parsePresetOptions({
//   entries: customOptions[package_name] ?? { entry: `src/index.ts` },
//   cjs: true,
// });

// if (!CI) {
//   const package_fields = preset.generatePackageExports(parsed_options);

//   if (writeExports) {
//     preset.writePackageJson(package_fields);
//   } else {
//     // eslint-disable-next-line no-console
//     console.log("Package json exports:", JSON.stringify(package_fields, null, 2));
//   }
// }

// const tsup_options = preset.generateTsupOptions(parsed_options);

// if (nodePlatform) {
//   for (const option of tsup_options) {
//     // by default, the platform is "browser" - it'll prevent using node builtins
//     option.platform = "node";
//   }
// }

// tsup_options.forEach(build);
