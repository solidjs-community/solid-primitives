import solid from "@solidjs/vite-plugin";
import { vitePlugin as ogp } from "@solidjs/ogp/unplugin";
import { createSolidBase } from "@kobalte/solidbase/config";
import defaultTheme from "@kobalte/solidbase/default-theme";
import { defineConfig } from "vite";
import { SITE_URL } from "./src/config";
import { sidebar } from "./src/generated/sidebar";
import { ogVersion } from "./scripts/og-version";

const solidBase = createSolidBase(defaultTheme);

// Crawlers need absolute og:image URLs, so builds bake in the canonical origin. Workers Builds
// doesn't expose a preview deployment's URL at build time, so previews point at production too.
// `SITE_ORIGIN` overrides it (e.g. `vite preview` on localhost).
const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? SITE_URL).replace(/\/$/, "");

export default defineConfig({
  define: {
    __SITE_ORIGIN__: JSON.stringify(SITE_ORIGIN),
    __OG_VERSION__: JSON.stringify(ogVersion()),
  },
  // SolidBase's theme depends on pinned @solid-primitives/*@next releases. Left external, the
  // prerender worker would resolve `@solid-primitives/utils` up the tree to a different copy
  // (the workspace's), so bundle them into the server build.
  ssr: { noExternal: [/^@solid-primitives\//] },
  // Solid's dev-only subpaths are otherwise discovered lazily at runtime. That makes Vite
  // re-optimize mid-session and change the dependency hash, so SolidBase's modules end up
  // loaded twice (two LocaleContexts: "useLocale must be called underneath a
  // LocaleContextProvider"). Pre-bundle them all up front.
  optimizeDeps: {
    include: [
      "solid-js",
      "solid-js/attribution",
      "solid-js/refresh",
      "@solidjs/web",
      "@solidjs/web/performance-tracks",
      "@solidjs/signals",
    ],
  },
  plugins: [
    // Compiles <DynamicImage> (src/components/OpenGraph.tsx) into GET server functions that
    // render the OG card PNGs on request. `enforce: "pre"`, but listed first to make that explicit.
    ogp(),
    solidBase.plugin({
      title: "Solid Primitives 2",
      titleTemplate: ":title | Solid Primitives 2",
      description: "High-quality reactive primitives for building applications in Solid2",
      siteUrl: SITE_URL,
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
          { text: "Philosophy", link: "/philosophy" },
          { text: "JSR & NPM", link: "/jsr-npm" },
          { text: "Contributors", link: "/contributors" },
          { text: "Security", link: "/security" },
          { text: "Migration", link: "/migration" },
        ],
        sidebar: {
          "/": sidebar,
        },
      },
    }),
    // start mode (SSR + static prerender into dist/client) replaces SolidStart + Nitro.
    // Pages stay prerendered; `serverFunctions` keeps dist/server so its `{ fetch }` handler can
    // render the OG cards (`/_server`) at build time — scripts/static-og.ts. dist/server is a build
    // tool only; it is not deployed.
    solid(solidBase.startConfig({ serverFunctions: true })),
  ],
});
