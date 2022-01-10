import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [
    solidPlugin(),
    Unocss({
      shortcuts: {
        "center-child": "flex justify-center items-center",
        caption: "text-sm font-mono leading-tight",
        btn: "bg-teal-600 border-1 border-teal-500 hover:bg-teal-500 rounded cursor-pointer center-child select-none text-white font-semibold p-4 py-3",
        "node-h": "p-8 flex justify-center items-center space-x-8 bg-gray-700 rounded-2xl",
        "node-v": "node-h flex-col space-x-0 space-y-8",
        ball: "w-8 h-8 fixed -top-4 -left-4 opacity-50 rounded-full pointer-events-none"
      }
    })
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false
  }
});
