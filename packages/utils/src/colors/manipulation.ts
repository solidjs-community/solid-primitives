/*
 * Portions of this file incorporate color science from the following sources:
 *
 * OKLab/OKLCH color space by Björn Ottosson.
 * MIT License, Copyright Björn Ottosson.
 * https://bottosson.github.io/posts/oklab/
 *
 * WCAG 2.1 relative luminance and contrast ratio formulas.
 * W3C Web Content Accessibility Guidelines 2.1, Copyright W3C.
 * https://www.w3.org/TR/WCAG21/#contrast-minimum
 */

import { clamp } from "../index.ts";
import { colorToOKLCH, normalizeHue, parseColor } from "./helpers.ts";
import type { Color, ColorFormat } from "./types.ts";

/**
 * Like {@link parseColor} but returns `undefined` instead of throwing for invalid input.
 *
 * @example
 * ```ts
 * tryParseColor("#3264C8") // Color
 * tryParseColor("nope")   // undefined
 * ```
 */
export function tryParseColor(value: string): Color | undefined {
  try {
    return parseColor(value);
  } catch {
    return undefined;
  }
}

/**
 * Returns `true` if `value` is a parseable color string.
 *
 * @example
 * ```ts
 * isValidColor("#3264C8") // true
 * isValidColor("nope")   // false
 * ```
 */
export function isValidColor(value: string): boolean {
  return tryParseColor(value) !== undefined;
}

/**
 * Detects the format of a color string without parsing it.
 * Returns `undefined` for strings that do not match any known format.
 *
 * The returned format reflects the **syntax** of the string (e.g. `"rgb"` for
 * `rgb(...)` even if an alpha channel is present via slash notation).
 *
 * @example
 * ```ts
 * detectColorFormat("#3264C8")            // "hex"
 * detectColorFormat("#3264C8FF")          // "hexa"
 * detectColorFormat("rgb(50, 100, 200)")  // "rgb"
 * detectColorFormat("hsla(220, 60%, 49%, 0.5)") // "hsla"
 * detectColorFormat("nope")              // undefined
 * ```
 */
export function detectColorFormat(value: string): ColorFormat | undefined {
  const s = value.trim();
  if (/^#[\da-f]+$/i.test(s)) {
    if (s.length === 4 || s.length === 7) return "hex";
    if (s.length === 5 || s.length === 9) return "hexa";
  }
  if (/^rgba?\(/i.test(s)) return /^rgba\(/i.test(s) ? "rgba" : "rgb";
  if (/^hsla?\(/i.test(s)) return /^hsla\(/i.test(s) ? "hsla" : "hsl";
  if (/^hsba?\(/i.test(s)) return /^hsba\(/i.test(s) ? "hsba" : "hsb";
  return undefined;
}

/**
 * Returns a new color with lightness increased by `amount` (0–1 ratio = percentage points).
 * Operates in HSL space; the returned color is in HSL.
 *
 * @example
 * ```ts
 * lighten(parseColor("hsl(220, 60%, 50%)"), 0.1).getChannelValue("lightness") // 60
 * ```
 */
export function lighten(color: Color, amount: number): Color {
  const hsl = color.toFormat("hsl");
  return hsl.withChannelValue("lightness", clamp(hsl.getChannelValue("lightness") + amount * 100, 0, 100));
}

/**
 * Returns a new color with lightness decreased by `amount` (0–1 ratio = percentage points).
 * Operates in HSL space; the returned color is in HSL.
 */
export function darken(color: Color, amount: number): Color {
  return lighten(color, -amount);
}

/**
 * Returns a new color with saturation increased by `amount` (0–1 ratio = percentage points).
 * Operates in HSL space; the returned color is in HSL.
 */
export function saturate(color: Color, amount: number): Color {
  const hsl = color.toFormat("hsl");
  return hsl.withChannelValue("saturation", clamp(hsl.getChannelValue("saturation") + amount * 100, 0, 100));
}

/**
 * Returns a new color with saturation decreased by `amount` (0–1 ratio = percentage points).
 * Operates in HSL space; the returned color is in HSL.
 */
export function desaturate(color: Color, amount: number): Color {
  return saturate(color, -amount);
}

/**
 * Returns the complementary color (hue rotated 180°), preserving saturation, lightness, and alpha.
 * The returned color is in HSL.
 *
 * @example
 * ```ts
 * complement(parseColor("hsl(60, 50%, 50%)")).getChannelValue("hue") // 240
 * ```
 */
export function complement(color: Color): Color {
  const hsl = color.toFormat("hsl");
  return hsl.withChannelValue("hue", normalizeHue(hsl.getChannelValue("hue") + 180));
}

/**
 * Mixes two colors in RGB space at the given `ratio` (0 = fully `a`, 1 = fully `b`).
 * Alpha is also interpolated. The returned color is in RGB.
 *
 * @example
 * ```ts
 * mix(parseColor("#000000"), parseColor("#ffffff")).toString("hex") // "#808080"
 * mix(parseColor("#000000"), parseColor("#ffffff"), 0.25).toString("hex") // "#404040"
 * ```
 */
export function mix(a: Color, b: Color, ratio = 0.5): Color {
  const r = Number.isFinite(ratio) ? clamp(ratio, 0, 1) : 0.5;
  const ra = a.toFormat("rgb");
  const rb = b.toFormat("rgb");
  const lerp = (x: number, y: number) => x + (y - x) * r;
  return ra
    .withChannelValue("red", Math.round(lerp(ra.getChannelValue("red"), rb.getChannelValue("red"))))
    .withChannelValue("green", Math.round(lerp(ra.getChannelValue("green"), rb.getChannelValue("green"))))
    .withChannelValue("blue", Math.round(lerp(ra.getChannelValue("blue"), rb.getChannelValue("blue"))))
    .withChannelValue("alpha", lerp(ra.getChannelValue("alpha"), rb.getChannelValue("alpha")));
}

/** WCAG 2.1 relative luminance. Alpha is ignored (assumes opaque rendering). */
function relativeLuminance(color: Color): number {
  const rgb = color.toFormat("rgb");
  const linearize = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * linearize(rgb.getChannelValue("red")) +
    0.7152 * linearize(rgb.getChannelValue("green")) +
    0.0722 * linearize(rgb.getChannelValue("blue"))
  );
}

/**
 * Returns the WCAG 2.1 contrast ratio between two colors (1–21).
 * The order of arguments does not matter.
 *
 * - Black on white: `21`
 * - Same color: `1`
 *
 * @example
 * ```ts
 * contrastRatio(parseColor("#000"), parseColor("#fff")) // 21
 * ```
 */
export function contrastRatio(a: Color, b: Color): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Returns whether the contrast between `foreground` and `background` meets the
 * specified WCAG 2.1 conformance level and text size.
 *
 * | Level | Normal text | Large text (≥18pt / ≥14pt bold) |
 * |-------|-------------|----------------------------------|
 * | AA    | 4.5 : 1     | 3 : 1                            |
 * | AAA   | 7 : 1       | 4.5 : 1                          |
 *
 * @example
 * ```ts
 * isReadable(parseColor("#fff"), parseColor("#000"))           // true  (AA, normal)
 * isReadable(parseColor("#fff"), parseColor("#000"), "AAA")    // true
 * isReadable(parseColor("#777"), parseColor("#fff"), "AAA")    // false
 * ```
 */
export function isReadable(
  foreground: Color,
  background: Color,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal",
): boolean {
  const ratio = contrastRatio(foreground, background);
  if (level === "AAA") return ratio >= (size === "large" ? 4.5 : 7);
  return ratio >= (size === "large" ? 3 : 4.5);
}

/**
 * Returns an array of `steps` colors linearly interpolated in RGB space between
 * `from` and `to`. The first element is `from`, the last is `to`.
 *
 * @throws if `steps` is not a finite integer >= 2.
 *
 * @example
 * ```ts
 * colorScale(parseColor("#000"), parseColor("#fff"), 3)
 * // [#000000, #808080, #FFFFFF]
 * ```
 */
export function colorScale(from: Color, to: Color, steps: number): Color[] {
  if (!Number.isFinite(steps) || !Number.isInteger(steps) || steps < 2)
    throw new Error("colorScale: steps must be a finite integer >= 2");
  return Array.from({ length: steps }, (_, i) => mix(from, to, i / (steps - 1)));
}

/** Interpolate between two OKLCH triplets, taking the shortest hue path. */
function lerpOKLCH(
  [l1, c1, h1]: [number, number, number],
  [l2, c2, h2]: [number, number, number],
  t: number,
): [number, number, number] {
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return [l1 + (l2 - l1) * t, c1 + (c2 - c1) * t, normalizeHue(h1 + dh * t)];
}

/**
 * Convert OKLCH back to an RGB `Color` via the OKLab → LMS → linear sRGB → sRGB pipeline.
 * Out-of-gamut values are clamped to [0, 1] before gamma encoding.
 * Coefficients from https://bottosson.github.io/posts/oklab/
 */
function oklchToColor(l: number, c: number, h: number, alpha: number): Color {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab → cube-root LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  // Cube to LMS, then combined (M1_inv × XYZ→sRGB) matrix to linear sRGB
  const ll = l_ ** 3;
  const mm = m_ ** 3;
  const ss = s_ ** 3;

  const r_lin = +4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
  const g_lin = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
  const b_lin = -0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss;

  const toSRGB = (v: number) => {
    const clamped = clamp(v, 0, 1);
    return Math.round((clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055) * 255);
  };

  return parseColor(`rgba(${toSRGB(r_lin)}, ${toSRGB(g_lin)}, ${toSRGB(b_lin)}, ${alpha})`);
}

/**
 * Returns an array of `steps` colors interpolated in OKLCH space between `from` and `to`.
 * OKLCH is a perceptually uniform color space, so the steps appear more evenly distributed
 * to the human eye than a plain RGB scale.
 *
 * Hue interpolation takes the shortest arc around the color wheel.
 * Alpha is linearly interpolated. The returned colors are in RGB.
 *
 * @throws if `steps` is not a finite integer >= 2.
 *
 * @example
 * ```ts
 * // A scale from red to blue that passes through purple rather than through green
 * perceptualColorScale(parseColor("hsl(0, 80%, 50%)"), parseColor("hsl(240, 80%, 50%)"), 5)
 * ```
 */
export function perceptualColorScale(from: Color, to: Color, steps: number): Color[] {
  if (!Number.isFinite(steps) || !Number.isInteger(steps) || steps < 2)
    throw new Error("perceptualColorScale: steps must be a finite integer >= 2");
  const fromOKLCH = colorToOKLCH(from);
  const toOKLCH = colorToOKLCH(to);
  const alphaFrom = from.getChannelValue("alpha");
  const alphaTo = to.getChannelValue("alpha");
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const [l, c, h] = lerpOKLCH(fromOKLCH, toOKLCH, t);
    return oklchToColor(l, c, h, alphaFrom + (alphaTo - alphaFrom) * t);
  });
}
