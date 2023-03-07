import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/solid-primitives/",
  plugins: [
    solid({
      adapter: "solid-start-static",
    }),
  ],
});
