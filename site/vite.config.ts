import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";
import solid from "solid-start/vite";
// @ts-ignore
import staticAdapter from "solid-start-static";
import dotenv from "dotenv";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageNames = fs.readdirSync(path.join(__dirname, "..", "packages"));
const packageRoutes = packageNames.map(name => `/package/${name}`);

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
        // hot: false,
        adapter: staticAdapter(),
        prerenderRoutes: ["/", ...packageRoutes],
      }),
    ],
  };
});
