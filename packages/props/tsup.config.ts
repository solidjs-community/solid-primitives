import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";
import defaultConfig from "../../tsup.config";

export default defineConfig(() => {
  return {
    ...defaultConfig,
    esbuildPlugins: [solidPlugin()],
    entryPoints: ["src/index.tsx"]
  };
});
