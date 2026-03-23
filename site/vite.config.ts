import { defineConfig, type Plugin } from "vite";
import { solidStart } from "@solidjs/start/config";
import { createSolidBase } from "@kobalte/solidbase/config";
import defaultTheme from "@kobalte/solidbase/default-theme";
import { dirname, resolve } from "node:path";
import sidebarData from "./src/_generated/sidebar.json" with { type: "json" };

// Workaround for @kobalte/solidbase 0.4.1 bug: Layout.jsx imports ../client/index.js
// but the built file is ../client/index.jsx
const solidbaseJsxFix: Plugin = {
  name: "solidbase-jsx-fix",
  resolveId(id, importer) {
    if (id === "../client/index.js" && importer?.includes("@kobalte/solidbase")) {
      return resolve(dirname(importer), "../client/index.jsx");
    }
  },
};

// Build the SolidBase sidebar from generated data
const sidebar = {
  "/packages": sidebarData,
};

const sb = createSolidBase(defaultTheme);

const solidBaseConfig = {
  title: "Solid Primitives",
  titleTemplate: ":title – Solid Primitives",
  description:
    "A project that strives to develop high-quality, community contributed SolidJS primitives.",
  lang: "en",
  lastUpdated: false,
  themeConfig: {
    socialLinks: {
      github: "https://github.com/solidjs-community/solid-primitives",
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "Packages", link: "/packages", activeMatch: "^/packages" },
    ],
    sidebar,
  },
};

const startOptions = sb.startConfig({
  ssr: false,
});

export default defineConfig({
  resolve: {
    dedupe: ["@solidjs/router", "solid-js", "@solidjs/meta"],
  },
  plugins: [solidbaseJsxFix, ...sb.plugin(solidBaseConfig), solidStart(startOptions)],
});
