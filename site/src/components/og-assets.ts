/**
 * URL of an image in `site/public` for use inside an OG card.
 *
 * The cards are rendered at build time by `scripts/static-og.ts`, and the image renderer only
 * accepts public http(s) or data: sources: it refuses loopback addresses (SSRF protection), and
 * embedding the ~700 KB cube as a data URL made each card take over a minute to render. So the
 * images are loaded from the repository's own files on GitHub, which exist independently of
 * whichever domain currently serves the site, so a build never depends on the live site.
 * `OG_ASSET_ORIGIN` overrides the base URL (it must serve the contents of `site/public`).
 *
 * Only the OG server functions call this, so client builds tree-shake it away.
 */
const DEFAULT_ASSET_ORIGIN =
  "https://raw.githubusercontent.com/solidjs-community/solid-primitives/main/site/public";

export function ogAssetUrl(file: string): string {
  const origin =
    (typeof process !== "undefined" ? process.env.OG_ASSET_ORIGIN : undefined) ??
    DEFAULT_ASSET_ORIGIN;
  return `${origin.replace(/\/$/, "")}/${file}`;
}
