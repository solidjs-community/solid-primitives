import defaultConfig from "../../configs/tsup.config";
import { defineConfig } from "tsup";

export default {
  ...defaultConfig,
  ...defineConfig({
    entryPoints: ["src/index.ts", "src/server.ts"]
  })
};
