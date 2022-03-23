import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "jsdom",
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    deps: {
      inline: [/solid-js/]
    }
  },
  plugins: [solidPlugin()],
  resolve: {
    conditions: ["development", "browser"]
  }
});
