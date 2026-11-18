/**
 * Public path of a pre-rendered OG card (see scripts/static-og.ts).
 *
 * The name is a deterministic hash of the card's render URL (`/_server/data/…?args=…`) and a
 * version of the card's source files, so three independent places agree on it without a manifest:
 * the build script that writes the file, the server render that bakes the tag into the HTML, and
 * the client, which re-evaluates the tag after hydration and on navigation. Including the version
 * changes every name when the card design changes, so the files can be cached as immutable.
 *
 * Plain functions only, no Node APIs: this runs in the browser too.
 */
export function ogStaticPath(renderPath: string, version: string): string {
  // cyrb53: a small, well-distributed 53-bit string hash.
  const input = `${version}\0${renderPath}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return `/og/${hash.toString(16).padStart(14, "0")}.png`;
}
