import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";
import solid from "solid-start/vite";
// @ts-ignore
import staticAdapter from "solid-start-static";
import dotenv from "dotenv";

export default defineConfig(() => {
  dotenv.config();
  return {
    plugins: [
      devtools({
        autoname: true,
        locator: {
          componentLocation: true,
          targetIDE: "vscode",
        },
      }),
      solid({
        hot: false,
        adapter: staticAdapter(),
      }),
    ],
  };
});
