import { BuildConfig } from "unbuild";
const config: BuildConfig = {
  entries: ["./src/index"],
  declaration: true,
  externals: ["solid-js"]
};
export default config;
