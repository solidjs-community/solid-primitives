import { defineConfig } from "vitest/config";
import defaultConfig from "../../vite.config";

export default defineConfig({
  ...defaultConfig,
  optimizeDeps: {
    exclude: ["@solid-primitives/utils", "@solid-primitives/rootless"]
  }
});
