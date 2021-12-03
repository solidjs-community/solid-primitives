import { defineConfig } from "tsup";
import defaultConfig from "../../tsup.config";

export default defineConfig(() => {
  return {
    ...defaultConfig,
    clean: false
  };
});
