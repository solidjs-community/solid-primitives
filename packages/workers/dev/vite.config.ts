import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [solidPlugin(), Unocss({})],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
