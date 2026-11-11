// tsdown.config.ts
import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

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
      "**/node_modules/**",
      "**/dist/**",
      "**/test?(s)/**",
      "**/t?(e)mp/**",
    ],
  },
});