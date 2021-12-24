import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";
import defaultConfig from "../../tsup.config";

export default defineConfig(() => {
  return {
    ...defaultConfig,
    dts: "src/index.tsx",
    esbuildPlugins: [solidPlugin()],
    entryPoints: ["src/index.tsx"]
  };
});
