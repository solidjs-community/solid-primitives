import { createMemo, Show } from "solid-js";
import { getRequestEvent, isServer, NoHydration } from "@solidjs/web";
import { Meta } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { DynamicImage, urlFromImage } from "@solidjs/ogp";
import { useFrontmatter, useSolidBaseContext } from "@kobalte/solidbase/client";
import { ogFonts } from "./og-fonts";

/**
 * Open Graph / Twitter card tags for every page, with a generated preview image.
 *
 * Each `<DynamicImage>` below is rewritten by the `@solidjs/ogp` compiler plugin (vite.config.ts)
 * into a GET server function served from `/_server`. On the page it becomes the URL of that
 * function, with every identifier/call/member expression used inside the JSX sent along as a
 * query argument. So:
 *
 * - Only pass short JSON-safe strings/numbers into the JSX (the whole URL must stay < 2000 chars).
 *   Literals (static text, style values) stay in the server function and cost nothing.
 * - Images are rendered by satori: flexbox only, and any element with more than one child needs
 *   `display: flex`.
 * - Each card is wrapped in <NoHydration>. The compiled template asks for a hydration key, and
 *   once the server process has rendered any page, Solid's `sharedConfig.context` is left set,
 *   so outside an owner that throws ("getNextContextId cannot be used under non-hydrating
 *   context") and the endpoint returns 500. NoHydration supplies an owner and turns keys off
 *   (@solidjs/ogp 0.1.0).
 * - `imageOptions` must be an inline object literal; the compiler copies it into the server
 *   function verbatim, so `ogFonts()` there runs on the server only.
 *
 * Pages are prerendered, so crawlers read the tags straight from the static HTML; the image itself
 * is rendered on request by the `/_server` endpoint of dist/server/server.js.
 */

const WIDTH = 1200;
const HEIGHT = 630;

/** Matches the `.stage-badge.stage-N` colors in app.css. */
const STAGE_COLORS: Record<number, { bg: string; fg: string }> = {
  0: { bg: "#fa233e", fg: "#ffffff" },
  1: { bg: "#ffa15c", fg: "#ffffff" },
  2: { bg: "#e9de47", fg: "#1a1a1a" },
  3: { bg: "#12c3a2", fg: "#ffffff" },
  4: { bg: "#2962ff", fg: "#ffffff" },
};

/** Keeps the description to roughly three lines on the card (and the image URL short). */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/**
 * Solid's SSR escapes `&` and `<` in text, and @solidjs/ogp hands that HTML to satori-html, which
 * doesn't decode entities, so they'd render literally as `&amp;` / `&lt;` (ogp 0.1.0).
 * Swap them for lookalikes until that's fixed upstream.
 */
function forImage(text: string): string {
  return text.replace(/\s*&\s*/g, " and ").replace(/</g, "‹");
}

/**
 * Origin for the absolute og:image / og:url values. Builds bake in `__SITE_ORIGIN__` (production,
 * or `SITE_ORIGIN` at build time). Under `vite dev` that origin doesn't serve this checkout's
 * `/_server` endpoint, so use the origin the page is actually being served from.
 */
function siteOrigin(): string {
  if (!import.meta.env.DEV) return __SITE_ORIGIN__;
  if (!isServer) return window.location.origin;
  const url = getRequestEvent()?.request.url;
  return url ? new URL(url).origin : __SITE_ORIGIN__;
}

type PackageFrontmatter = {
  title?: string;
  description?: string;
  package?: string;
  category?: string;
  stage?: number;
  primitives?: number;
};

// ---------------------------------------------------------------------------------------------
// Card design mirrors the landing page (src/routes/index.mdx + app.css, light theme): white page
// with the 48px brand-blue grid and top-left glow fading out, the mono uppercase `.pl-eyebrow`,
// a near-black `.pl-headline` with a blue `.pl-accent` line, and `.pl-stat` cards.
//
// These helper components hold only literal markup, so the ogp compiler leaves them alone (it
// only turns identifiers/calls/member expressions inside <DynamicImage> into URL arguments) and
// they render inside the server function. Values: --pl-primary #017ad4, --sb-heading-color
// hsl(240 6% 10%) = #18181b, --sb-text-color hsl(240 5% 26%) = #3f3f46.
// ---------------------------------------------------------------------------------------------

/**
 * The site's `html` background: radial glow, 48px grid, then a fade to white. Even these empty
 * layers need `display: flex`; satori-html's output otherwise fails satori's multi-child check.
 */
function Backdrop() {
  return (
    <>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "0",
          left: "0",
          width: "1200px",
          height: "630px",
          "background-image":
            "radial-gradient(circle at 12% 0%, rgba(1, 122, 212, 0.20) 0%, rgba(1, 122, 212, 0) 60%)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "0",
          left: "0",
          width: "1200px",
          height: "630px",
          "background-image":
            "linear-gradient(to right, rgba(1, 122, 212, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(1, 122, 212, 0.12) 1px, transparent 1px)",
          "background-size": "48px 48px",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "0",
          left: "0",
          width: "1200px",
          height: "630px",
          "background-image":
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 45%, #ffffff 100%)",
        }}
      />
    </>
  );
}

/** Header logo + the "v2.0-RC2" badge (`[class*="version-selector_"]::after` in app.css). */
function Brand() {
  return (
    <div style={{ display: "flex", "align-items": "center" }}>
      <img
        src="https://primitives2.solidjs.community/logo-light.png"
        style={{ width: "242px", height: "44px" }}
      />
      <div
        style={{
          display: "flex",
          "margin-left": "18px",
          padding: "4px 12px",
          "border-radius": "8px",
          background: "#017ad4",
          color: "#ffffff",
          "font-family": "Geist Mono",
          "font-weight": 600,
          "font-size": "20px",
        }}
      >
        v2.0-RC2
      </div>
    </div>
  );
}

/** The hero's wireframe cube (`.pl-hero-cube`). */
function Cube() {
  return (
    <img
      src="https://primitives2.solidjs.community/logo-wire.png"
      style={{
        position: "absolute",
        right: "64px",
        top: "150px",
        width: "300px",
        height: "295px",
      }}
    />
  );
}

function packageCardUrl(fm: PackageFrontmatter): string {
  const title = forImage(fm.title ?? fm.package ?? "");
  // Long names ("Intersection Observer") would wrap at the full size and push the stats down.
  const titleSize = title.length > 16 ? "64px" : "84px";
  const name = `@solid-primitives/${fm.package}`;
  const description = forImage(truncate(fm.description ?? "", 110));
  const eyebrow = `— ${forImage(fm.category ?? "Primitives")}`;
  const stage = String(fm.stage ?? 0);
  const stageBg = STAGE_COLORS[fm.stage ?? 0]?.bg ?? STAGE_COLORS[0]!.bg;
  const stageFg = STAGE_COLORS[fm.stage ?? 0]?.fg ?? "#ffffff";
  const count = String(fm.primitives ?? 0);
  const countLabel = fm.primitives === 1 ? "primitive" : "primitives";

  return urlFromImage(
    <DynamicImage imageOptions={{ width: 1200, height: 630, fonts: ogFonts() }}>
      <NoHydration>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "space-between",
            padding: "56px 64px",
            background: "#ffffff",
            color: "#18181b",
            "font-family": "Geist",
          }}
        >
          <Backdrop />
          <Cube />
          <Brand />
          <div style={{ display: "flex", "flex-direction": "column", width: "760px" }}>
            <div
              style={{
                display: "flex",
                "font-family": "Geist Mono",
                "font-weight": 600,
                "font-size": "22px",
                "letter-spacing": "0.06em",
                "text-transform": "uppercase",
                color: "#017ad4",
                "margin-bottom": "18px",
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                "font-size": titleSize,
                "font-weight": 700,
                "line-height": 1.08,
                "letter-spacing": "-0.01em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                "font-size": "36px",
                "font-weight": 700,
                "line-height": 1.2,
                color: "#017ad4",
                "margin-top": "6px",
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                "margin-top": "20px",
                "font-size": "26px",
                "line-height": 1.5,
                color: "#3f3f46",
              }}
            >
              {description}
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                width: "220px",
                padding: "18px 22px",
                border: "1px solid #e4e4e7",
                "border-radius": "12px",
                background: "#f7f7f8",
                "margin-right": "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  "font-size": "40px",
                  "font-weight": 700,
                  "line-height": 1.1,
                  color: "#017ad4",
                }}
              >
                {count}
              </div>
              <div
                style={{
                  display: "flex",
                  "margin-top": "6px",
                  "font-family": "Geist Mono",
                  "font-weight": 600,
                  "font-size": "16px",
                  "letter-spacing": "0.04em",
                  "text-transform": "uppercase",
                  color: "#71717a",
                }}
              >
                {countLabel}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                width: "220px",
                padding: "18px 22px",
                border: "1px solid #e4e4e7",
                "border-radius": "12px",
                background: "#f7f7f8",
              }}
            >
              <div style={{ display: "flex", height: "44px", "align-items": "center" }}>
                <div
                  style={{
                    display: "flex",
                    "justify-content": "center",
                    "min-width": "44px",
                    padding: "4px 12px",
                    "border-radius": "8px",
                    "font-family": "Geist Mono",
                    "font-weight": 600,
                    "font-size": "26px",
                    background: stageBg,
                    color: stageFg,
                  }}
                >
                  {stage}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  "margin-top": "6px",
                  "font-family": "Geist Mono",
                  "font-weight": 600,
                  "font-size": "16px",
                  "letter-spacing": "0.04em",
                  "text-transform": "uppercase",
                  color: "#71717a",
                }}
              >
                Stage
              </div>
            </div>
          </div>
        </div>
      </NoHydration>
    </DynamicImage>,
  )();
}

function defaultCardUrl(): string {
  // Text with non-ASCII characters goes in as whole values. Written statically inside
  // <DynamicImage>, Solid compiles "—" to `&#8212;`, which satori-html renders literally; and
  // static text mixed with an inserted value in one element loses everything before the value.
  const eyebrow = "— A reactive primitives library for Solid 2.0";
  const subtitle =
    "Composable, tree-shakeable primitive packages — signals, browser APIs, animation, and more.";
  return urlFromImage(
    <DynamicImage imageOptions={{ width: 1200, height: 630, fonts: ogFonts() }}>
      <NoHydration>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "space-between",
            padding: "56px 64px",
            background: "#ffffff",
            color: "#18181b",
            "font-family": "Geist",
          }}
        >
          <Backdrop />
          <Cube />
          <Brand />
          <div style={{ display: "flex", "flex-direction": "column", width: "780px" }}>
            <div
              style={{
                display: "flex",
                "font-family": "Geist Mono",
                "font-weight": 600,
                "font-size": "22px",
                "letter-spacing": "0.06em",
                "text-transform": "uppercase",
                color: "#017ad4",
                "margin-bottom": "22px",
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                "font-size": "64px",
                "font-weight": 700,
                "line-height": 1.12,
                "letter-spacing": "-0.01em",
              }}
            >
              <div style={{ display: "flex" }}>You write the app logic.</div>
              <div style={{ display: "flex", color: "#017ad4" }}>
                We ship the primitives that keep up.
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "720px",
              "font-size": "26px",
              "line-height": 1.5,
              color: "#3f3f46",
            }}
          >
            {subtitle}
          </div>
        </div>
      </NoHydration>
    </DynamicImage>,
  )();
}

export function SiteOpenGraph() {
  const frontmatter = useFrontmatter<PackageFrontmatter>();
  const { config, metaTitle } = useSolidBaseContext();
  const location = useLocation();
  const origin = siteOrigin();

  // Inside a memo so client-side navigation re-evaluates the image arguments: the compiled
  // <DynamicImage> captures its argument values when it's called.
  const image = createMemo(() => {
    const fm = frontmatter();
    return origin + (fm?.package ? packageCardUrl(fm) : defaultCardUrl());
  });
  const description = () => frontmatter()?.description ?? config().description;

  return (
    <>
      <Meta property="og:type" content="website" />
      <Meta property="og:site_name" content={config().title} />
      <Meta property="og:title" content={metaTitle()} />
      <Meta property="og:url" content={origin + location.pathname} />
      <Show when={description()}>{d => <Meta property="og:description" content={d()} />}</Show>
      <Meta property="og:image" content={image()} />
      <Meta property="og:image:width" content={String(WIDTH)} />
      <Meta property="og:image:height" content={String(HEIGHT)} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:image" content={image()} />
    </>
  );
}
