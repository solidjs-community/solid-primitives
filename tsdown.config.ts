// tsdown.config.ts
import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";
import { UNMIGRATED_PACKAGES } from "./scripts/utils/unmigrated-packages.ts";

export default defineConfig({
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  platform: "neutral",
  dts: true,
  clean: true,
  unbundle: true,

  plugins: [
    solid({
      solid: {
        // Solid 2.0 moved the DOM runtime out of `solid-js/web`. Pin it explicitly so a
        // plugin/dependency default can never emit imports of the removed path again
        // (see https://github.com/solidjs-community/solid-primitives/issues/1098).
        moduleName: "@solidjs/web",
        generate: "dom",
        hydratable: false,
      },
    }),
  ],

  deps: {
    skipNodeModulesBundle: true,
    neverBundle: [/^node:/, /^@solid-primitives\//],
  },

  outputOptions(outputOptions) {
    outputOptions.postBanner = chunk => {
      if (!chunk.isEntry) return "";

      const dtsPath = `./${chunk.fileName.replace(/\.js$/, ".d.ts").split("/").at(-1)}`;
      return `/* @ts-self-types="${dtsPath}" */`;
    };

    return outputOptions;
  },

  workspace: {
    include: ["packages/*"],
    exclude: [
      "site",
      "template",
      "packages/storage/tauri-storage",
      // still on Solid 1.x until migrated (see scripts/utils/unmigrated-packages.ts)
      ...UNMIGRATED_PACKAGES.map(name => `packages/${name}`),
      "**/node_modules/**",
      "**/dist/**",
      "**/test?(s)/**",
      "**/t?(e)mp/**",
    ],
  },
});
