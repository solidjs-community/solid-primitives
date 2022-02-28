import { defineConfig } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";
import defaultConfig from "../../tsup.config";

export default defineConfig({
  ...defaultConfig,
  esbuildPlugins: [solidPlugin()]
});
