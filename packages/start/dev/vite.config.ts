import { defineConfig } from "vite";
import solid from "solid-start/vite";
import Unocss from "unocss/vite";

export default defineConfig({
  plugins: [solid(), Unocss({})],
  build: {
    target: "esnext",
  },
});
