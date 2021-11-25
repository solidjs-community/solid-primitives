import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [
    solidPlugin(),
    Unocss({
      shortcuts: {
        "center-child": "flex justify-center items-center",
        caption: "text-xs text-gray-500",
        "btn-node":
          "absolute -inset-1px bg-teal-600 border-1 border-teal-500 hover:bg-teal-500 rounded cursor-pointer center-child select-none",
        "btn-node-parent":
          "w-14 h-10 relative bg-gray-800 border-1 border-gray-700 hover:bg-gray-700 rounded cursor-pointer"
      }
    })
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false
  }
});
