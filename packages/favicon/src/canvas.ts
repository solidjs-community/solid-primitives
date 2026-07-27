import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, type MaybeAccessor, noop } from "@solid-primitives/utils";
import { makeFavicon } from "./favicon.ts";
import type { FaviconController, FaviconOptions } from "./link.ts";

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
 * Wraps a `make*` canvas-overlay primitive's fire-and-forget render: applies `render`'s result
 * via `favicon.setHref` once it settles, unless `dispose()` has already run by then — otherwise a
 * badge/progress draw that resolves after disposal would re-add a removed favicon `<link>`, or
 * overwrite the previous href `dispose()` just restored, with a stale composite. `render` itself
 * already falls back to the plain `href` on any internal failure (see `drawBaseIcon`), so a
 * rejection here is unexpected; treated the same as "leave the current href alone" rather than
 * risk an unhandled rejection.
 */
export function guardAsyncRender(
  favicon: FaviconController,
  render: Promise<string>,
): FaviconController {
  let disposed = false;
  render.then(dataUrl => {
    if (!disposed) favicon.setHref(dataUrl);
  }, noop);
  return {
    get href() {
      return favicon.href;
    },
    setHref: favicon.setHref,
    dispose() {
      disposed = true;
      favicon.dispose();
    },
  };
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
    render(h, v, options).then(dataUrl => {
      if (id !== requestId) return; // superseded by a more recent href/value change, or disposed
      favicon.setHref(dataUrl);
      // Read back the DOM-resolved href (browsers resolve relative `href`s to absolute URLs)
      // rather than trusting `dataUrl` verbatim, so this always matches the non-reactive `make*`
      // variant's `.href` getter.
      setCurrent(favicon.href);
    }, noop); // `render` already falls back to the plain href internally, so a rejection here is
    // unexpected — nothing to apply beyond avoiding an unhandled rejection.
  };

  if (typeof href === "function" || typeof value === "function") {
    createEffect(
      () => [access(href), access(value)] as const,
      ([h, v]) => redraw(h, v),
    );
  } else {
    redraw(href, value);
  }

  onCleanup(() => {
    // Invalidate any redraw still in flight first, reusing the same `requestId` guard `redraw`
    // checks above — otherwise a draw that settles after disposal could still call
    // `favicon.setHref`/`setCurrent` on an already-disposed favicon/signal.
    requestId++;
    favicon.dispose();
  });

  return current;
}
