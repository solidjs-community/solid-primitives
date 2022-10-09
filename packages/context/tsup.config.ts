import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";
import defaultConfig from "../../configs/tsup.config";

export default defineConfig({
  ...defaultConfig,
  esbuildPlugins: [solidPlugin()]
});
