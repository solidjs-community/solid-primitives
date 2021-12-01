import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: "src/index.ts",
  format: ["esm", "cjs"],
  entryPoints: ["src/index.ts"]
});
