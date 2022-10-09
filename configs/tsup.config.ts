import { defineConfig } from "tsup";

const defaultConfig = defineConfig({
  clean: true,
  dts: "src/index.ts",
  format: ["esm", "cjs"],
  entryPoints: ["src/index.ts"]
});
export default defaultConfig;

export const doubleEntryConfig = defineConfig({
  ...defaultConfig,
  entryPoints: ["src/index.ts", "src/server.ts"]
});
