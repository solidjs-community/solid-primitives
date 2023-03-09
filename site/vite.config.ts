import solid from "solid-start/vite";
import { defineConfig } from "vite";
// @ts-ignore
import staticAdapter from "solid-start-static";
import dotenv from "dotenv";

export default defineConfig(() => {
  dotenv.config();
  return {
    plugins: [
      solid({
        hot: false,
        adapter: staticAdapter(),
      }),
    ],
  };
});
