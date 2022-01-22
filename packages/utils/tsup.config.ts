import defaultConfig from "../../tsup.config";
import { defineConfig } from "tsup";

export default {
  ...defaultConfig,
  ...defineConfig({
    entryPoints: ["src/index.ts", "src/fp.ts", "src/setter.ts"],
    dts: true
  })
};
