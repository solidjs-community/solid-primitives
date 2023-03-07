import solid from "solid-start/vite";
import { defineConfig } from "vite";
// @ts-ignore
import staticAdapter from "solid-start-static";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageNames = fs.readdirSync(path.join(__dirname, "..", "packages"));
const packageRoutes = packageNames.map(name => `/package/${name}`);

export default defineConfig({
  plugins: [
    solid({
      hot: false,
      adapter: staticAdapter(),
      prerenderRoutes: ["/", ...packageRoutes],
    }),
  ],
});
