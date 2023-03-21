import { defineConfig, UserConfig } from "vite";
import devtools from "solid-devtools/vite";
import solid from "solid-start/vite";
// @ts-ignore
import staticAdapter from "solid-start-static";

import { generatePackagesData } from "./scripts/generate-modules-data";

declare global {
  var _viteConfig: UserConfig | undefined;
}

export default defineConfig(async () => {
  // when generating static site, vite.config.ts is executed multiple times
  if (globalThis._viteConfig) {
    return globalThis._viteConfig;
  }

  const modules = await generatePackagesData();

  return (globalThis._viteConfig = {
    plugins: [
      devtools({
        autoname: true,
        locator: {
          componentLocation: true,
          targetIDE: "vscode",
        },
      }),
      solid({
        adapter: staticAdapter(),
        prerenderRoutes: ["/", ...modules.map(name => `/package/${name}`)],
      }),
    ],
  });
});
