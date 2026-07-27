import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, type MaybeAccessor } from "@solid-primitives/utils";
import { makeFavicon } from "./favicon.ts";
import type { FaviconOptions } from "./link.ts";

/** Loads `src` into an `Image`, resolving once it's decoded (or rejecting on error). */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`favicon: failed to load image "${src}"`));
    img.src = src;
  });
}

/**
 * Loads `href` and draws it onto a fresh, appropriately-sized offscreen canvas. Returns
 * `undefined` if the image fails to load or the canvas context is unavailable — callers should
 * fall back to the plain `href` rather than let a broken overlay take down the favicon entirely.
 */
export async function drawBaseIcon(
  href: string,
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; size: number } | undefined> {
  let img: HTMLImageElement;
  try {
    img = await loadImage(href);
  } catch {
    return undefined;
  }
  const size = img.naturalWidth || img.naturalHeight || 32;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  return { canvas, ctx, size };
}

/**
 * Shared reactive wiring for `create*` primitives that composite a canvas overlay onto a base
 * icon (badge, progress ring, …): applies `render(href, value, options)`'s result via
 * `makeFavicon`, coalescing out-of-order async completions so only the most recent `href`/`value`
 * pair's draw ever gets applied, and restores the previous favicon `onCleanup`. Extracted once a
 * second such primitive (`progress.ts`) needed the exact same wiring `badge.ts` already had —
 * this is behavior with a real correctness property (the coalescing), not just boilerplate, so
 * keeping it in one place means a future fix to it can't accidentally apply to only one caller.
 */
export function createCanvasFavicon<Value, Options extends FaviconOptions>(
  href: MaybeAccessor<string>,
  value: MaybeAccessor<Value>,
  options: Options,
  render: (href: string, value: Value, options: Options) => Promise<string>,
): Accessor<string> {
  if (isServer) {
    return () => access(href);
  }

  // `untrack` — read outside JSX/a memo/an effect's compute phase would otherwise trip Solid's
  // `STRICT_READ_UNTRACKED` dev diagnostic.
  const favicon = makeFavicon(
    untrack(() => access(href)),
    options,
  );
  const [current, setCurrent] = createSignal(favicon.href, INTERNAL_OPTIONS);

  let requestId = 0;
  const redraw = (h: string, v: Value): void => {
    const id = ++requestId;
    void render(h, v, options).then(dataUrl => {
      if (id !== requestId) return; // superseded by a more recent href/value change
      favicon.setHref(dataUrl);
      // Read back the DOM-resolved href (browsers resolve relative `href`s to absolute URLs)
      // rather than trusting `dataUrl` verbatim, so this always matches the non-reactive `make*`
      // variant's `.href` getter.
      setCurrent(favicon.href);
    });
  };

  if (typeof href === "function" || typeof value === "function") {
    createEffect(
      () => [access(href), access(value)] as const,
      ([h, v]) => redraw(h, v),
    );
  } else {
    redraw(href, value);
  }

  onCleanup(favicon.dispose);

  return current;
}
