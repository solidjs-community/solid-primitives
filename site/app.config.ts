import { defineConfig } from "@solidjs/start/config";
import { createWithSolidBase } from "@kobalte/solidbase/config";
import defaultTheme from "@kobalte/solidbase/default-theme";
import sidebarData from "./src/_generated/sidebar.json" with { type: "json" };
import packagesData from "./src/_generated/packages.json" with { type: "json" };

// Build the SolidBase sidebar from generated data
const sidebar = {
  "/packages": sidebarData,
};

// Explicitly prerender all package routes
const packageRoutes = (packagesData as Array<{ name: string }>).map(
  pkg => `/packages/${pkg.name}`,
);

export default defineConfig(
  createWithSolidBase(defaultTheme)(
    {
      ssr: true,
      serialization: { mode: "json" },
      server: {
        preset: "static",
        prerender: {
          crawlLinks: true,
          routes: ["/", "/packages", ...packageRoutes],
        },
      },
    },
    {
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
    },
  ),
);
