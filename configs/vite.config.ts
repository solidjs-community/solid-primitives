import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";
import path from "path";

export const viteConfig = defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    solidPlugin(),
    Unocss({
      shortcuts: {
        "center-child": "flex justify-center items-center",
        caption: "text-sm font-mono leading-tight",
        btn: "bg-teal-600 border-1 border-teal-500 hover:bg-teal-500 rounded cursor-pointer center-child select-none text-white font-semibold p-4 py-3 m-2",
        "wrapper-h":
          "p-6 flex justify-center items-center space-x-4 space-y-0 bg-gray-700 rounded-2xl",
        "wrapper-v": "wrapper-h flex-col space-x-0 space-y-4",
        node: "p-4 bg-orange-600 rounded m-2",
        input: "bg-gray-800 rounded border border-gray-600 px-3 py-2 text-white",
        ball: "w-8 h-8 fixed -top-4 -left-4 opacity-50 rounded-full pointer-events-none"
      }
    })
  ],
  optimizeDeps: {
    exclude: ["@solid-primitives/utils"]
  },
  build: {
    target: "esnext"
  }
});

export const vitestConfig = defineConfig({
  test: {
    watch: false,
    env: {
      DEV: "1",
      SSR: "",
      PROD: ""
    },
    setupFiles: [path.resolve(__dirname, "ssr.setup.ts")],
    globals: true,
    clearMocks: true,
    passWithNoTests: true,
    environment: "jsdom",
    transformMode: {
      web: [/\.[jt]sx?$/]
    }
  },
  resolve: {
    conditions: ["browser", "development"]
  }
});
