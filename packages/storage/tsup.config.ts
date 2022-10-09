import { defineConfig } from "tsup";
import defaultConfig from "../../configs/tsup.config";

export default defineConfig(() => {
  return {
    ...defaultConfig,
    dts: true,
    entryPoints: ["src/index.ts", "src/cookies.ts", "src/storage.ts", "src/tools.ts"]
  };
});
