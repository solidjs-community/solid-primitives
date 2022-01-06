import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [
    solidPlugin(),
    Unocss({
      shortcuts: {
        card: "flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg",
        "countdown-cell": "px-2 py-1 bg-gray-100 rounded",
        "countdown-cell-number": "text-xl font-bold"
      }
    })
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false
  }
});
