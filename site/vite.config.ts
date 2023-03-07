import solid from "solid-start/vite";
import { defineConfig } from "vite";
// @ts-ignore
import netlify from "solid-start-netlify";

export default defineConfig({
  plugins: [
    solid({
      adapter: netlify({}),
      prerenderRoutes: ["/"],
    }),
  ],
});
