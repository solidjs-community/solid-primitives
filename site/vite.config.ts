import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import { createSolidBase } from "@kobalte/solidbase/config";
import defaultTheme from "@kobalte/solidbase/default-theme";
import { sidebar } from "./src/generated/sidebar";

const solidbase = createSolidBase(defaultTheme);

export default defineConfig({
  plugins: [
    {
      name: "fix-solidbase",
      enforce: "pre",
      resolveId(id, importer) {
        if (importer?.includes("@kobalte/solidbase") && id.endsWith(".js")) {
          return this.resolve(id.replace(/\.js$/, ""), importer, { skipSelf: true });
        }
      },
    },
    solidbase.plugin({
      title: "Solid Primitives 2",
      titleTemplate: ":title | Solid Primitives 2",
      description: "High-quality reactive primitives for building applications in Solid2",
      // Base/fallback src — app.css swaps the actual rendered image per data-theme.
      logo: "/logo-light.png",
      lastUpdated: false,
      themeConfig: {
        // We ship Geist ourselves via app.css instead of the theme's bundled fonts.
        fonts: {
          inter: false,
          lexend: false,
          jetbrainsMono: false,
        },
        socialLinks: {
          github: "https://github.com/solidjs-community/solid-primitives",
          discord: "https://discord.com/invite/solidjs",
        },
        nav: [
          { text: "Guide", link: "/" },
          { text: "Primitives", link: "/primitives" },
        ],
        sidebar: {
          "/": sidebar,
        },
      },
    }),
    solidStart(solidbase.startConfig()),
    nitro({
      // `preset` is a NitroConfig field, which the vite plugin only reads from `config`
      // (not top-level) — see nitro/dist/vite.d.mts's NitroPluginConfig type.
      config: {
        // Cloudflare Pages — static assets + a bundled `_worker.js` SSR fallback.
        preset: "cloudflare-pages",
        // Auto-generate the wrangler config on build instead of requiring a hand-written one.
        cloudflare: {
          deployConfig: true,
        },
      },
    }),
  ],
});
