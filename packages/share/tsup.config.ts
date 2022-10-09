import { defineConfig } from "tsup";
import defaultConfig from "../../configs/tsup.config";

export default defineConfig(() => {
  return {
    ...defaultConfig,
    entryPoints: ["src/index.ts", "src/server.ts", "src/networks.ts"]
  };
});
