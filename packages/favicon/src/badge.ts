import type { Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { type MaybeAccessor, noop } from "@solid-primitives/utils";
import { makeFavicon } from "./favicon.ts";
import { createCanvasFavicon, drawBaseIcon } from "./canvas.ts";
import type { FaviconController, FaviconOptions } from "./link.ts";

export type FaviconBadgeValue = number | string | boolean | undefined;

export type FaviconBadgePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type FaviconBadgeOptions = {
  /** Background color of the badge. @default "#e11d48" */
  color?: string;
  /** Text color drawn inside the badge. @default "#ffffff" */
  textColor?: string;
  /** Corner the badge is drawn in. @default "bottom-right" */
  position?: FaviconBadgePosition;
  /** Numeric values greater than `max` render as `"{max}+"`. @default 99 */
  max?: number;
  /** Badge diameter as a fraction of the icon's rendered size. @default 0.6 */
  scale?: number;
} & FaviconOptions;

/** `0`, `false`, `undefined`, and `""` all mean "no badge" — the base icon is used as-is. */
function shouldShowBadge(value: FaviconBadgeValue): boolean {
  return (
    value === true ||
    (typeof value === "number" && value !== 0) ||
    (typeof value === "string" && value !== "")
  );
}

function badgeText(value: FaviconBadgeValue, max: number): string | undefined {
  if (typeof value === "number") return value > max ? `${max}+` : `${value}`;
  if (typeof value === "string") return value;
  return undefined; // `true` — dot only, no text
}

/**
 * Composites `value` as a badge onto `href`, returning a data URL. Returns `href` unchanged when
 * `value` doesn't warrant a badge, or when the base image fails to load — a broken badge overlay
 * shouldn't take down the favicon entirely.
 */
async function renderBadgeIcon(
  href: string,
  value: FaviconBadgeValue,
  options: FaviconBadgeOptions,
): Promise<string> {
  if (!shouldShowBadge(value)) return href;

  const {
    color = "#e11d48",
    textColor = "#ffffff",
    position = "bottom-right",
    max = 99,
    scale = 0.6,
  } = options;

  const base = await drawBaseIcon(href);
  if (!base) return href;
  const { canvas, ctx, size } = base;

  const radius = (size * scale) / 2;
  const cx = position.endsWith("right") ? size - radius : radius;
  const cy = position.startsWith("bottom") ? size - radius : radius;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  const text = badgeText(value, max);
  if (text !== undefined) {
    ctx.fillStyle = textColor;
    ctx.font = `${Math.round(radius * (text.length > 1 ? 1.1 : 1.4))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, cy);
  }

  return canvas.toDataURL("image/png");
}

/**
 * Overlays a notification badge (a count, short string, or plain dot) on top of `href` and sets
 * it as the document favicon.
 *
 * Non-reactive: `href`/`value` are read once. For a reactive, auto-redrawing version see
 * {@link createFaviconBadge}.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#makeFaviconBadge
 * @example
 * const badge = makeFaviconBadge("/favicon.png", 3);
 * badge.dispose(); // restores the previous favicon
 */
export function makeFaviconBadge(
  href: string,
  value: FaviconBadgeValue,
  options: FaviconBadgeOptions = {},
): FaviconController {
  if (isServer) {
    return { href, setHref: noop, dispose: noop };
  }

  const favicon = makeFavicon(href, options);
  void renderBadgeIcon(href, value, options).then(dataUrl => favicon.setHref(dataUrl));
  return favicon;
}

/**
 * Reactively overlays a notification badge on top of `href`, redrawing whenever `href` or `value`
 * change. Restores the previous favicon on cleanup.
 *
 * @returns an accessor of the currently-applied (possibly badged) favicon href
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#createFaviconBadge
 * @example
 * const href = createFaviconBadge("/favicon.png", () => unreadCount());
 */
export function createFaviconBadge(
  href: MaybeAccessor<string>,
  value: MaybeAccessor<FaviconBadgeValue>,
  options: FaviconBadgeOptions = {},
): Accessor<string> {
  return createCanvasFavicon(href, value, options, renderBadgeIcon);
}
