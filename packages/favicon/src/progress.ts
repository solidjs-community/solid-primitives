import type { Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { type MaybeAccessor, noop } from "@solid-primitives/utils";
import { makeFavicon } from "./favicon.ts";
import { createCanvasFavicon, drawBaseIcon, guardAsyncRender } from "./canvas.ts";
import type { FaviconController, FaviconOptions } from "./link.ts";

export type FaviconProgressOptions = {
  /** Color of the unfilled ring track. @default "rgba(0, 0, 0, 0.15)" */
  trackColor?: string;
  /** Color of the filled progress arc. @default "#6366f1" */
  color?: string;
  /** Ring stroke width as a fraction of the icon's rendered size. @default 0.15 */
  thickness?: number;
} & FaviconOptions;

/**
 * Composites `progress` as a ring around `href`, returning a data URL. Returns `href` unchanged
 * when `progress` is `undefined`, or when the base image fails to load — a broken ring overlay
 * shouldn't take down the favicon entirely.
 */
async function renderProgressIcon(
  href: string,
  progress: number | undefined,
  options: FaviconProgressOptions,
): Promise<string> {
  if (progress === undefined) return href;

  const { trackColor = "rgba(0, 0, 0, 0.15)", color = "#6366f1", thickness = 0.15 } = options;
  const clamped = Math.min(100, Math.max(0, progress));

  const base = await drawBaseIcon(href);
  if (!base) return href;
  const { canvas, ctx, size } = base;

  const lineWidth = size * thickness;
  const radius = (size - lineWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.strokeStyle = trackColor;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (clamped > 0) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    const start = -Math.PI / 2;
    const end = start + (Math.PI * 2 * clamped) / 100;
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();
  }

  return canvas.toDataURL("image/png");
}

/**
 * Overlays a progress ring (0–100) around `href` and sets it as the document favicon — for
 * upload/download-style indicators. `undefined` shows the base icon with no ring.
 *
 * Non-reactive: `href`/`progress` are read once. For a reactive, auto-redrawing version see
 * {@link createFaviconProgress}.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#makeFaviconProgress
 * @example
 * const favicon = makeFaviconProgress("/favicon.png", 40);
 * favicon.dispose(); // restores the previous favicon
 */
export function makeFaviconProgress(
  href: string,
  progress: number | undefined,
  options: FaviconProgressOptions = {},
): FaviconController {
  if (isServer) {
    return { href, setHref: noop, dispose: noop };
  }

  const favicon = makeFavicon(href, options);
  return guardAsyncRender(favicon, renderProgressIcon(href, progress, options));
}

/**
 * Reactively overlays a progress ring around `href`, redrawing whenever `href` or `progress`
 * change. Restores the previous favicon on cleanup.
 *
 * @returns an accessor of the currently-applied (possibly ringed) favicon href
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#createFaviconProgress
 * @example
 * const href = createFaviconProgress("/favicon.png", () => uploadProgress());
 */
export function createFaviconProgress(
  href: MaybeAccessor<string>,
  progress: MaybeAccessor<number | undefined>,
  options: FaviconProgressOptions = {},
): Accessor<string> {
  return createCanvasFavicon(href, progress, options, renderProgressIcon);
}
