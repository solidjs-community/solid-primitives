/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright Fabien Marie-Louise.
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/colors
 *
 * Which in turn is based on code from React Spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/68e305768cb829bab7b9836dded593bd731259f3/packages/%40react-stately/color/src/Color.ts
 */

import { clamp } from "../index.js";
import type { ColorIntlTranslations } from "./intl.js";
import type {
  ColorAxes,
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorSpace,
  Color as IColor,
} from "./types.js";

/**
 * Parses a color string into a {@link Color} object.
 *
 * Supported formats:
 * - **Hex**: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
 * - **RGB**: `rgb(r g b)`, `rgb(r, g, b)`, `rgb(r g b / a)`, `rgba(r, g, b, a)`
 * - **HSL**: `hsl(h, s%, l%)`, `hsla(h, s%, l%, a)`
 * - **HSB**: `hsb(h, s%, b%)`, `hsba(h, s%, b%, a)`
 *
 * @throws if the string does not match any supported format.
 *
 * @example
 * ```ts
 * const color = parseColor("#3264C8");
 * color.toString("hsl"); // "hsl(220 60% 49.02%)"
 * ```
 */
export function parseColor(value: string): IColor {
  const res = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value);
  if (res) return res;
  throw new Error(`Invalid color value: ${value}`);
}

/**
 * Accepts either a color string or an existing {@link Color} and always returns a `Color`.
 * Useful for normalizing props that accept both forms.
 */
export function normalizeColor(v: string | IColor): IColor {
  return typeof v === "string" ? parseColor(v) : v;
}

/**
 * Returns the ordered channel triple for a given color space.
 *
 * - `"rgb"` → `["red", "green", "blue"]`
 * - `"hsl"` → `["hue", "saturation", "lightness"]`
 * - `"hsb"` → `["hue", "saturation", "brightness"]`
 */
export function getColorChannels(colorSpace: ColorSpace): [ColorChannel, ColorChannel, ColorChannel] {
  switch (colorSpace) {
    case "rgb":
      return RGBColor.colorChannels;
    case "hsl":
      return HSLColor.colorChannels;
    case "hsb":
      return HSBColor.colorChannels;
  }
}

/**
 * Normalizes a hue angle to the range `[0, 360]`.
 * Exactly `360` is kept as-is so that a full-circle endpoint stays distinct from `0`.
 */
export function normalizeHue(hue: number): number {
  if (hue === 360) return hue;
  return ((hue % 360) + 360) % 360;
}

// Lightness threshold separating orange (L ≥ 0.68) from brown (L < 0.68) in OKLCH.
const ORANGE_LIGHTNESS_THRESHOLD = 0.68;
// Below this OKLCH lightness, yellow hues are labelled "yellow green" instead of "yellow".
const YELLOW_GREEN_LIGHTNESS_THRESHOLD = 0.85;
// OKLCH L ≤ this value is considered "dark" for the lightness descriptor.
const MAX_DARK_LIGHTNESS = 0.55;
// OKLCH chroma below this threshold is treated as achromatic (gray).
const GRAY_THRESHOLD = 0.001;

/**
 * Ordered hue-segment table for `getOklchHue`. Each entry is `[startDegrees, hueName]`.
 * A hue angle H belongs to segment i when `OKLCH_HUES[i][0] <= H < OKLCH_HUES[i+1][0]`.
 * The list wraps: angles ≥ 349° fall back to `"pink"` (the implicit 360° endpoint).
 */
const OKLCH_HUES: [number, string][] = [
  [0, "pink"],
  [15, "red"],
  [48, "orange"],
  [94, "yellow"],
  [135, "green"],
  [175, "cyan"],
  [264, "blue"],
  [284, "purple"],
  [320, "magenta"],
  [349, "pink"],
];

/** Formats `value` with the runtime locale (`undefined` = user's system locale). */
function formatNumber(value: number, options: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(undefined, options).format(value);
}

/**
 * Shared base providing concrete implementations of the channel-read/write, naming,
 * and axis-resolution methods declared on {@link IColor}. Subclasses (`RGBColor`,
 * `HSBColor`, `HSLColor`) supply format conversion and the channel-range /
 * format-options API.
 *
 * Channel names are used directly as private field names on each subclass so that
 * `getChannelValue` / `withChannelValue` can read and write them via string keying
 * without a per-subclass switch statement.
 */
abstract class Color implements IColor {
  abstract toFormat(format: ColorFormat): IColor;
  abstract toString(format: ColorFormat | "css"): string;
  abstract clone(): IColor;
  abstract getChannelRange(channel: ColorChannel): ColorChannelRange;
  abstract getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
  abstract formatChannelValue(channel: ColorChannel): string;

  /** Delegates to RGB since only `RGBColor` can pack channels directly into a 24-bit int. */
  toHexInt(): number {
    return this.toFormat("rgb").toHexInt();
  }

  /**
   * Reads a channel value by name. Channel name strings correspond directly to
   * the private field names on each concrete subclass (e.g. `"red"` → `this.red`).
   * The `@ts-expect-error` suppresses the untyped index-access warning.
   */
  getChannelValue(channel: ColorChannel): number {
    if (channel in this) {
      // @ts-expect-error — channel names map to private fields (see class-level doc)
      return this[channel];
    }
    throw new Error(`Unsupported color channel: ${channel}`);
  }

  /**
   * Returns a shallow clone of this color with one channel replaced.
   * Clones first to preserve immutability, then writes via the same string-keyed
   * approach as `getChannelValue`.
   */
  withChannelValue(channel: ColorChannel, value: number): IColor {
    if (channel in this) {
      const x = this.clone();
      // @ts-expect-error — see getChannelValue
      x[channel] = value;
      return x;
    }
    throw new Error(`Unsupported color channel: ${channel}`);
  }

  /** Returns the translation string for `channel` (e.g. `"Hue"`, `"Saturation"`). */
  getChannelName(channel: ColorChannel, translations: ColorIntlTranslations): string {
    return translations[channel];
  }

  abstract getColorSpace(): ColorSpace;

  /**
   * Resolves the three channel axes used by a 2D color-area picker.
   * `xChannel` and `yChannel` are caller-supplied (either may be omitted).
   * `zChannel` is the remaining channel not already assigned to x or y.
   * Omitted channels are filled in order from the color space's channel list.
   */
  getColorSpaceAxes(xyChannels: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes {
    const { xChannel, yChannel } = xyChannels;
    const xCh = xChannel || this.getColorChannels().find(c => c !== yChannel)!;
    const yCh = yChannel || this.getColorChannels().find(c => c !== xCh)!;
    const zCh = this.getColorChannels().find(c => c !== xCh && c !== yCh)!;
    return { xChannel: xCh, yChannel: yCh, zChannel: zCh };
  }

  abstract getColorChannels(): [ColorChannel, ColorChannel, ColorChannel];

  /**
   * Produces a human-readable color description (e.g. `"dark vibrant blue"`) suitable
   * for `aria-label` attributes. Uses OKLCH — a perceptually uniform space — so that
   * lightness and chroma descriptors correspond to what the eye perceives.
   *
   * Pipeline:
   * 1. Convert to OKLCH (L = perceived lightness 0–1, C = chroma, H = hue angle).
   * 2. Short-circuit for near-white (L > 0.999) and near-black (L < 0.001).
   * 3. Map hue angle to a named hue family via `getOklchHue` (handles orange/brown split,
   *    hue blending at segment midpoints, etc.).
   * 4. Choose a chroma descriptor: `"pale"` or `"grayish"` for low-C, `"vibrant"` for high-C.
   * 5. Choose a lightness descriptor: `"very dark"` / `"dark"` / `"light"` / `"very light"`.
   * 6. Compose via `translations.colorName`. If alpha < 1, append the transparency percentage.
   */
  getColorName(translations: ColorIntlTranslations): string {
    const [initialL, c, h] = colorToOKLCH(this);
    let l = initialL;

    if (l > 0.999) return translations.white;
    if (l < 0.001) return translations.black;

    const [hue, newL] = this.getOklchHue(l, c, h, translations);
    l = newL;

    let lightness = "";
    let chroma = "";
    if (c <= 0.1 && c >= GRAY_THRESHOLD) {
      chroma = l >= 0.7 ? "pale" : "grayish";
    } else if (c >= 0.15) {
      chroma = "vibrant";
    }

    if (l < 0.3) {
      lightness = "very dark";
    } else if (l < MAX_DARK_LIGHTNESS) {
      lightness = "dark";
    } else if (l < 0.7) {
      // no descriptor for mid-range lightness
    } else if (l < 0.85) {
      lightness = "light";
    } else {
      lightness = "very light";
    }

    // @ts-expect-error
    if (chroma) chroma = translations[chroma];
    // @ts-expect-error
    if (lightness) lightness = translations[lightness];

    const alpha = this.getChannelValue("alpha");
    if (alpha < 1) {
      const percentTransparent = formatNumber(1 - alpha, { style: "percent" });
      return translations
        .transparentColorName(lightness, chroma, hue, percentTransparent)
        .replace(/\s+/g, " ")
        .trim();
    }
    return translations.colorName(lightness, chroma, hue).replace(/\s+/g, " ").trim();
  }

  /**
   * Maps OKLCH `(L, C, H)` to a named hue family and optionally adjusts `L`.
   *
   * Special cases:
   * - **Orange vs brown**: Hues in the orange segment (48–94°) are classified as
   *   `"brown"` when L < `ORANGE_LIGHTNESS_THRESHOLD`. For true orange, L is shifted
   *   down by the threshold so that the lightness descriptor still reads naturally.
   * - **Yellow green**: Yellow (94–135°) reads as `"yellow green"` when L is below
   *   `YELLOW_GREEN_LIGHTNESS_THRESHOLD`.
   * - **Hue blending**: When H falls in the upper half of a segment (past the midpoint
   *   toward the next hue), the name becomes a compound `"<current> <next>"` (e.g.
   *   `"blue purple"`), unless the two adjacent segment names are already the same
   *   (the pink wrap-around case).
   * - **Achromatic fallback**: Returns `"gray"` immediately when C < `GRAY_THRESHOLD`.
   */
  private getOklchHue(
    l: number,
    c: number,
    h: number,
    translations: ColorIntlTranslations,
  ): [string, number] {
    if (c < GRAY_THRESHOLD) return [translations.gray, l];

    for (let i = 0; i < OKLCH_HUES.length; i++) {
      const [hue] = OKLCH_HUES[i]!;
      let hueName = OKLCH_HUES[i]![1];
      const [nextHue, nextHueName] = OKLCH_HUES[i + 1] || [360, "pink"];

      if (h >= hue && h < nextHue) {
        if (hueName === "orange") {
          if (l < ORANGE_LIGHTNESS_THRESHOLD) {
            hueName = "brown";
          } else {
            // Shift L so mid-lightness orange doesn't get a "light" descriptor.
            l = l - ORANGE_LIGHTNESS_THRESHOLD + MAX_DARK_LIGHTNESS;
          }
        }

        if (h > hue + (nextHue - hue) / 2 && hueName !== nextHueName) {
          // Past the midpoint of the segment — blend toward the next hue.
          hueName = `${hueName} ${nextHueName}`;
        } else if (hueName === "yellow" && l < YELLOW_GREEN_LIGHTNESS_THRESHOLD) {
          hueName = "yellow green";
        }

        // @ts-expect-error — hueName is a dynamic key into translations
        return [translations[hueName], l];
      }
    }

    throw new Error("Unexpected hue");
  }

  /** Returns only the hue family name (e.g. `"blue"`) without lightness/chroma descriptors. */
  getHueName(translations: ColorIntlTranslations): string {
    const [l, c, h] = colorToOKLCH(this);
    const [name] = this.getOklchHue(l, c, h, translations);
    return name;
  }
}

/**
 * RGB color with red/green/blue stored as integers in `[0, 255]` and alpha as a
 * float in `[0, 1]`. This is the canonical representation — hex strings and `rgb()`
 * strings parse directly into this class, and all other spaces delegate `toHexInt()`
 * through an RGB conversion.
 */
class RGBColor extends Color {
  constructor(
    private red: number,
    private green: number,
    private blue: number,
    private alpha: number,
  ) {
    super();
  }

  /**
   * Parses hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`) and `rgb()`/`rgba()` strings.
   * Returns `undefined` for non-matching input.
   *
   * Hex shorthand is expanded by doubling each nibble (`#abc` → `#aabbcc`).
   * The alpha byte (if present in hex) is normalized from the `[0, 255]` range to `[0, 1]`.
   * Both space-separated (`rgb(r g b / a)`) and comma-separated (`rgb(r, g, b)`) syntaxes
   * are accepted; a trailing `%` on the alpha token is treated as a fraction.
   */
  static parse(value: string): RGBColor | undefined {
    let colors: Array<number | undefined> = [];

    if (/^#[\da-f]+$/i.test(value) && [4, 5, 7, 9].includes(value.length)) {
      // Expand 3/4-digit shorthand by doubling each hex nibble.
      const values = (value.length < 6 ? value.replace(/[^#]/gi, "$&$&") : value)
        .slice(1)
        .split("");
      while (values.length > 0) {
        colors.push(Number.parseInt(values.splice(0, 2).join(""), 16));
      }
      // Hex alpha is 0–255; normalize to 0–1.
      colors[3] = colors[3] !== undefined ? colors[3] / 255 : undefined;
    }

    const match = value.match(/^rgba?\((.*)\)$/);
    if (match?.[1]) {
      colors = match[1]
        .replace(/(\d+)%$/u, (_substring, numberValue) =>
          (Number(numberValue) / 100).toString(),
        )
        .replaceAll(/,|\//gu, " ")
        .replaceAll(/\s{2,}/gu, " ")
        .split(" ")
        .map(v => Number(v.trim()));
      colors = colors.map((num, i) => clamp(num ?? 0, 0, i < 3 ? 255 : 1));
    }

    if (colors[0] === undefined || colors[1] === undefined || colors[2] === undefined) {
      return undefined;
    }

    return colors.length < 3
      ? undefined
      : new RGBColor(colors[0], colors[1], colors[2], colors[3] ?? 1);
  }

  toString(format: ColorFormat | "css" = "css"): string {
    switch (format) {
      case "hex":
        return `#${(
          this.red.toString(16).padStart(2, "0") +
          this.green.toString(16).padStart(2, "0") +
          this.blue.toString(16).padStart(2, "0")
        ).toUpperCase()}`;
      case "hexa":
        return `#${(
          this.red.toString(16).padStart(2, "0") +
          this.green.toString(16).padStart(2, "0") +
          this.blue.toString(16).padStart(2, "0") +
          Math.round(this.alpha * 255)
            .toString(16)
            .padStart(2, "0")
        ).toUpperCase()}`;
      case "css":
      case "rgb":
        return `rgb(${this.red}, ${this.green}, ${this.blue}${
          this.alpha !== 1 && this.alpha !== 100 ? ` / ${this.alpha}` : ""
        })`;
      case "rgba":
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case "hex":
      case "hexa":
      case "rgb":
      case "rgba":
        return this;
      case "hsb":
      case "hsba":
        return this.toHSB();
      case "hsl":
      case "hsla":
        return this.toHSL();
      default:
        throw new Error(`Unsupported color conversion: rgb -> ${format}`);
    }
  }

  /** Packs red/green/blue into a 24-bit integer via bitwise shifts (alpha is not included). */
  toHexInt(): number {
    return (this.red << 16) | (this.green << 8) | this.blue;
  }

  /**
   * Standard RGB → HSB conversion.
   * brightness = max(r, g, b); saturation = chroma / brightness;
   * hue is derived from which primary sits at the maximum.
   */
  private toHSB(): IColor {
    const red = this.red / 255;
    const green = this.green / 255;
    const blue = this.blue / 255;
    const min = Math.min(red, green, blue);
    const brightness = Math.max(red, green, blue);
    const chroma = brightness - min;
    const saturation = brightness === 0 ? 0 : chroma / brightness;
    let hue = 0;

    if (chroma !== 0) {
      switch (brightness) {
        case red:
          hue = (green - blue) / chroma + (green < blue ? 6 : 0);
          break;
        case green:
          hue = (blue - red) / chroma + 2;
          break;
        case blue:
          hue = (red - green) / chroma + 4;
          break;
      }
      hue /= 6;
    }

    return new HSBColor(
      toFixedNumber(hue * 360, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(brightness * 100, 2),
      this.alpha,
    );
  }

  /**
   * Standard RGB → HSL conversion.
   * lightness = (max + min) / 2;
   * saturation = chroma / (1 − |2L − 1|);
   * hue uses the same sector formula as `toHSB`.
   */
  private toHSL(): IColor {
    const red = this.red / 255;
    const green = this.green / 255;
    const blue = this.blue / 255;
    const min = Math.min(red, green, blue);
    const max = Math.max(red, green, blue);
    const lightness = (max + min) / 2;
    const chroma = max - min;
    let hue: number;
    let saturation: number;

    if (chroma === 0) {
      hue = saturation = 0;
    } else {
      saturation = chroma / (lightness < 0.5 ? max + min : 2 - max - min);
      switch (max) {
        case red:
          hue = (green - blue) / chroma + (green < blue ? 6 : 0);
          break;
        case green:
          hue = (blue - red) / chroma + 2;
          break;
        default:
          hue = (red - green) / chroma + 4;
          break;
      }
      hue /= 6;
    }

    return new HSLColor(
      toFixedNumber(hue * 360, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(lightness * 100, 2),
      this.alpha,
    );
  }

  clone(): IColor {
    return new RGBColor(this.red, this.green, this.blue, this.alpha);
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "red":
      case "green":
      case "blue":
        return { minValue: 0x0, maxValue: 0xff, step: 0x1, pageSize: 0x11 };
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 };
      default:
        throw new Error(`Unknown color channel: ${channel}`);
    }
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "red":
      case "green":
      case "blue":
        return { style: "decimal" };
      case "alpha":
        return { style: "percent", maximumFractionDigits: 2 };
      default:
        throw new Error(`Unknown color channel: ${channel}`);
    }
  }

  formatChannelValue(channel: ColorChannel): string {
    return formatNumber(this.getChannelValue(channel), this.getChannelFormatOptions(channel));
  }

  getColorSpace(): ColorSpace {
    return "rgb";
  }

  static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["red", "green", "blue"];
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return RGBColor.colorChannels;
  }
}

// Matches `hsb(h, s%, b%)` and `hsba(h, s%, b%, a)`.
// Components are comma-separated; values may be signed or decimal.
const HSB_REGEX =
  /hsb\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsba\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;

/**
 * HSB (Hue–Saturation–Brightness) color, also known as HSV (Hue–Saturation–Value).
 * Hue is in degrees `[0, 360]`; saturation and brightness are percentages `[0, 100]`;
 * alpha is a float `[0, 1]`.
 */
class HSBColor extends Color {
  constructor(
    private hue: number,
    private saturation: number,
    private brightness: number,
    private alpha: number,
  ) {
    super();
  }

  /**
   * Parses `hsb(h, s%, b%)` and `hsba(h, s%, b%, a)` strings via `HSB_REGEX`.
   * Returns `undefined` for non-matching input.
   * Hue is normalised with `normalizeHue`; saturation/brightness are clamped to 0–100;
   * alpha defaults to 1 when absent.
   */
  static parse(value: string): HSBColor | undefined {
    let m: RegExpMatchArray | null;
    if ((m = value.match(HSB_REGEX))) {
      const [h, s, b, a] = (m[1] ?? m[2])!
        .split(",")
        .map(n => Number(n.trim().replace("%", "")));
      return new HSBColor(
        normalizeHue(h!),
        clamp(s!, 0, 100),
        clamp(b!, 0, 100),
        clamp(a ?? 1, 0, 1),
      );
    }
  }

  toString(format: ColorFormat | "css" = "css"): string {
    switch (format) {
      case "css":
        // HSB is not a native CSS format; fall back to HSL for browser compatibility.
        return this.toHSL().toString("css");
      case "hex":
        return this.toRGB().toString("hex");
      case "hexa":
        return this.toRGB().toString("hexa");
      case "hsb":
        return `hsb(${this.hue} ${toFixedNumber(this.saturation, 2)}% ${toFixedNumber(this.brightness, 2)}%)`;
      case "hsba":
        return `hsba(${this.hue} ${toFixedNumber(this.saturation, 2)}% ${toFixedNumber(this.brightness, 2)}% ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case "hsb":
      case "hsba":
        return this;
      case "hsl":
      case "hsla":
        return this.toHSL();
      case "rgb":
      case "rgba":
        return this.toRGB();
      default:
        throw new Error(`Unsupported color conversion: hsb -> ${format}`);
    }
  }

  /**
   * HSB → HSL conversion:
   *   L = B × (1 − S/2);
   *   S_hsl = (B − L) / min(L, 1 − L)  (0 at achromatic extremes)
   */
  private toHSL(): IColor {
    let saturation = this.saturation / 100;
    const brightness = this.brightness / 100;
    const lightness = brightness * (1 - saturation / 2);
    saturation =
      lightness === 0 || lightness === 1
        ? 0
        : (brightness - lightness) / Math.min(lightness, 1 - lightness);

    return new HSLColor(
      toFixedNumber(this.hue, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(lightness * 100, 2),
      this.alpha,
    );
  }

  /**
   * HSB → RGB using the compact HSV formula.
   * `fn(n)` evaluates one channel:
   *   channel = B − S·B · clamp((n + H/60) mod 6, 0, 1)
   * where n=5 → red, n=3 → green, n=1 → blue.
   */
  private toRGB(): IColor {
    const hue = this.hue;
    const saturation = this.saturation / 100;
    const brightness = this.brightness / 100;
    const fn = (n: number, k = (n + hue / 60) % 6) =>
      brightness - saturation * brightness * Math.max(Math.min(k, 4 - k, 1), 0);
    return new RGBColor(
      Math.round(fn(5) * 255),
      Math.round(fn(3) * 255),
      Math.round(fn(1) * 255),
      this.alpha,
    );
  }

  clone(): IColor {
    return new HSBColor(this.hue, this.saturation, this.brightness, this.alpha);
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return { minValue: 0, maxValue: 360, step: 1, pageSize: 15 };
      case "saturation":
      case "brightness":
        return { minValue: 0, maxValue: 100, step: 1, pageSize: 10 };
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 };
      default:
        throw new Error(`Unknown color channel: ${channel}`);
    }
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "hue":
        return { style: "unit", unit: "degree", unitDisplay: "narrow" };
      case "saturation":
      case "brightness":
      case "alpha":
        return { style: "percent", maximumFractionDigits: 2 };
      default:
        throw new Error(`Unknown color channel: ${channel}`);
    }
  }

  formatChannelValue(channel: ColorChannel): string {
    let value = this.getChannelValue(channel);
    // saturation/brightness are stored as 0–100 but formatted as 0–1 percentages
    if (channel === "saturation" || channel === "brightness") value /= 100;
    return formatNumber(value, this.getChannelFormatOptions(channel));
  }

  getColorSpace(): ColorSpace {
    return "hsb";
  }

  static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = [
    "hue",
    "saturation",
    "brightness",
  ];
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return HSBColor.colorChannels;
  }
}

// Matches `hsl(h, s%, l%)` and `hsla(h, s%, l%, a)`.
// Components are comma-separated; values may be signed or decimal.
const HSL_REGEX =
  /hsl\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsla\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;

/**
 * HSL (Hue–Saturation–Lightness) color — the native CSS color notation.
 * Hue is in degrees `[0, 360]`; saturation and lightness are percentages `[0, 100]`;
 * alpha is a float `[0, 1]`.
 */
class HSLColor extends Color {
  constructor(
    private hue: number,
    private saturation: number,
    private lightness: number,
    private alpha: number,
  ) {
    super();
  }

  /**
   * Parses `hsl(h, s%, l%)` and `hsla(h, s%, l%, a)` strings via `HSL_REGEX`.
   * Returns `undefined` for non-matching input.
   * Hue is normalised with `normalizeHue`; saturation/lightness are clamped to 0–100;
   * alpha defaults to 1 when absent.
   */
  static parse(value: string): HSLColor | undefined {
    let m: RegExpMatchArray | null;
    if ((m = value.match(HSL_REGEX))) {
      const [h, s, l, a] = (m[1] ?? m[2])!
        .split(",")
        .map(n => Number(n.trim().replace("%", "")));
      return new HSLColor(
        normalizeHue(h!),
        clamp(s!, 0, 100),
        clamp(l!, 0, 100),
        clamp(a ?? 1, 0, 1),
      );
    }
  }

  toString(format: ColorFormat | "css" = "css"): string {
    switch (format) {
      case "hex":
        return this.toRGB().toString("hex");
      case "hexa":
        return this.toRGB().toString("hexa");
      case "hsl":
        return `hsl(${this.hue} ${toFixedNumber(this.saturation, 2)}% ${toFixedNumber(this.lightness, 2)}%${
          this.alpha !== 1 && this.alpha !== 100 ? ` / ${this.alpha}` : ""
        })`;
      case "css":
      case "hsla":
        return `hsla(${this.hue} ${toFixedNumber(this.saturation, 2)}% ${toFixedNumber(this.lightness, 2)}% / ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case "hsl":
      case "hsla":
        return this;
      case "hsb":
      case "hsba":
        return this.toHSB();
      case "rgb":
      case "rgba":
        return this.toRGB();
      default:
        throw new Error(`Unsupported color conversion: hsl -> ${format}`);
    }
  }

  /**
   * HSL → HSB conversion:
   *   B = L + S·min(L, 1 − L);
   *   S_hsb = 2·(1 − L/B)  (0 when B = 0)
   */
  private toHSB(): IColor {
    let saturation = this.saturation / 100;
    const lightness = this.lightness / 100;
    const brightness = lightness + saturation * Math.min(lightness, 1 - lightness);
    saturation = brightness === 0 ? 0 : 2 * (1 - lightness / brightness);
    return new HSBColor(
      toFixedNumber(this.hue, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(brightness * 100, 2),
      this.alpha,
    );
  }

  /**
   * HSL → RGB using the smooth HSL formula.
   * `a = S·min(L, 1−L)` is the chroma amplitude.
   * `fn(n)` evaluates one channel:
   *   channel = L − a·clamp((n + H/30) mod 12 − 3, −1, 1)
   * where n=0 → red, n=8 → green, n=4 → blue.
   */
  private toRGB(): IColor {
    const hue = this.hue;
    const saturation = this.saturation / 100;
    const lightness = this.lightness / 100;
    const a = saturation * Math.min(lightness, 1 - lightness);
    const fn = (n: number, k = (n + hue / 30) % 12) =>
      lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return new RGBColor(
      Math.round(fn(0) * 255),
      Math.round(fn(8) * 255),
      Math.round(fn(4) * 255),
      this.alpha,
    );
  }

  clone(): IColor {
    return new HSLColor(this.hue, this.saturation, this.lightness, this.alpha);
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return { minValue: 0, maxValue: 360, step: 1, pageSize: 15 };
      case "saturation":
      case "lightness":
        return { minValue: 0, maxValue: 100, step: 1, pageSize: 10 };
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 };
      default:
        throw new Error(`Unknown color channel: ${channel}`);
    }
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "hue":
        return { style: "unit", unit: "degree", unitDisplay: "narrow" };
      case "saturation":
      case "lightness":
      case "alpha":
        return { style: "percent", maximumFractionDigits: 2 };
      default:
        throw new Error(`Unknown color channel: ${channel}`);
    }
  }

  formatChannelValue(channel: ColorChannel): string {
    let value = this.getChannelValue(channel);
    // saturation/lightness are stored as 0–100 but formatted as 0–1 percentages
    if (channel === "saturation" || channel === "lightness") value /= 100;
    return formatNumber(value, this.getChannelFormatOptions(channel));
  }

  getColorSpace(): ColorSpace {
    return "hsl";
  }

  static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = [
    "hue",
    "saturation",
    "lightness",
  ];
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return HSLColor.colorChannels;
  }
}

/**
 * Converts any {@link Color} to OKLCH `[L, C, H]` — a perceptually uniform space
 * where L is perceived lightness (0–1), C is chroma (≥ 0), and H is a hue angle (0–360).
 *
 * Full pipeline: sRGB bytes → linear sRGB (gamma-expand) → CIE XYZ D65 → OKLab → OKLCH.
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function colorToOKLCH(color: IColor): [l: number, c: number, h: number] {
  const rgb = color.toFormat("rgb");
  let red = rgb.getChannelValue("red") / 255;
  let green = rgb.getChannelValue("green") / 255;
  let blue = rgb.getChannelValue("blue") / 255;
  [red, green, blue] = lin_sRGB(red, green, blue);
  const [x, y, z] = lin_sRGB_to_XYZ(red, green, blue);
  const [l, a, b] = XYZ_to_OKLab(x, y, z);
  return OKLab_to_OKLCH(l, a, b);
}

/**
 * Converts OKLab `(L, a, b)` to cylindrical OKLCH `(L, C, H)`.
 * C = sqrt(a² + b²); H = atan2(b, a) in degrees, normalised to [0, 360).
 */
function OKLab_to_OKLCH(l: number, a: number, b: number): [number, number, number] {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return [l, Math.sqrt(a ** 2 + b ** 2), hue >= 0 ? hue : hue + 360];
}

/** Applies sRGB gamma expansion component-wise, converting display-encoded sRGB to linear light. */
function lin_sRGB(r: number, g: number, b: number): [number, number, number] {
  return [lin_sRGB_component(r), lin_sRGB_component(g), lin_sRGB_component(b)];
}

/**
 * IEC 61966-2-1 sRGB gamma expansion (the inverse EOTF).
 * Values in the linear region (|v| ≤ 0.04045) are divided by 12.92.
 * Larger values follow the power curve: sign(v) · ((|v| + 0.055) / 1.055)^2.4.
 */
function lin_sRGB_component(val: number): number {
  const sign = val < 0 ? -1 : 1;
  const abs = Math.abs(val);
  if (abs <= 0.04045) return val / 12.92;
  return sign * ((abs + 0.055) / 1.055) ** 2.4;
}

/**
 * Transforms linear sRGB to CIE XYZ adapted to the D65 white point.
 * The matrix coefficients are expressed as exact rational fractions (as in the CSS Color 4
 * spec) to avoid floating-point rounding accumulation that can occur with decimal literals.
 */
function lin_sRGB_to_XYZ(r: number, g: number, b: number): [number, number, number] {
  const M = [
    506752 / 1228815,
    87881 / 245763,
    12673 / 70218,
    87098 / 409605,
    175762 / 245763,
    12673 / 175545,
    7918 / 409605,
    87881 / 737289,
    1001167 / 1053270,
  ];
  return multiplyMatrix(M, r, g, b);
}

/**
 * Converts CIE XYZ to OKLab via Björn Ottosson's two-step LMS approach:
 *   1. XYZ → LMS using a linear matrix (XYZtoLMS).
 *   2. Cube-root each LMS component (perceptual non-linearity).
 *   3. LMS^(1/3) → OKLab using a second linear matrix (LMStoOKLab).
 *
 * The result is a perceptually uniform Lab space where equal Euclidean distances
 * correspond to equal perceived color differences.
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
function XYZ_to_OKLab(x: number, y: number, z: number): [number, number, number] {
  const XYZtoLMS = [
    0.819022437996703, 0.3619062600528904, -0.1288737815209879, 0.0329836539323885,
    0.9292868615863434, 0.0361446663506424, 0.0481771893596242, 0.2642395317527308,
    0.6335478284694309,
  ];
  const LMStoOKLab = [
    0.210454268309314, 0.7936177747023054, -0.0040720430116193, 1.9779985324311684,
    -2.4285922420485799, 0.450593709617411, 0.0259040424655478, 0.7827717124575296,
    -0.8086757549230774,
  ];
  const [a, b, c] = multiplyMatrix(XYZtoLMS, x, y, z);
  return multiplyMatrix(LMStoOKLab, Math.cbrt(a), Math.cbrt(b), Math.cbrt(c));
}

/**
 * Multiplies a flat row-major 3×3 matrix `m` by the column vector `[x, y, z]`.
 * Layout: `m = [m00, m01, m02, m10, m11, m12, m20, m21, m22]`.
 */
function multiplyMatrix(m: number[], x: number, y: number, z: number): [number, number, number] {
  return [
    m[0]! * x + m[1]! * y + m[2]! * z,
    m[3]! * x + m[4]! * y + m[5]! * z,
    m[6]! * x + m[7]! * y + m[8]! * z,
  ];
}

/**
 * Rounds `value` to `digits` decimal places in `base`.
 * Uses integer scaling instead of `toFixed` to avoid floating-point string round-trips.
 */
function toFixedNumber(value: number, digits: number, base = 10): number {
  const pow = base ** digits;
  return Math.round(value * pow) / pow;
}
