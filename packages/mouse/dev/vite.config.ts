import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [
    solidPlugin(),
    Unocss({
      shortcuts: {
        "center-child": "flex justify-center items-center",
        caption: "text-sm text-white opacity-60 font-mono leading-tight"
      }
    })
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false
  }
});
