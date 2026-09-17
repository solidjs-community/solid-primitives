import { defineConfig } from "tsdown";
import shared from "../../tsdown.config.ts";

export default defineConfig({
  ...shared,
  name: "@solid-primitives/collections",
  workspace: false,
  entry: ["src/index.ts", "src/serialization.ts"],
  tsconfig: "tsconfig.json",
});
