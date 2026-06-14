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
 * https://github.com/adobe/react-spectrum/blob/68e305768cb829bab7b9836dded593bd731259f3/packages/%40react-types/color/src/index.d.ts
 */

import type { ColorIntlTranslations } from "./intl.js";

/** Supported color string formats. Formats without an `a` suffix treat alpha as fully opaque. */
export type ColorFormat =
  | "hex"
  | "hexa"
  | "rgb"
  | "rgba"
  | "hsl"
  | "hsla"
  | "hsb"
  | "hsba";

/** The three supported color spaces. */
export type ColorSpace = "rgb" | "hsl" | "hsb";

/** Individual channel names across all supported color spaces. */
export type ColorChannel =
  | "hue"
  | "saturation"
  | "brightness"
  | "lightness"
  | "red"
  | "green"
  | "blue"
  | "alpha";

/** Maps x/y/z axes to {@link ColorChannel} names for 2D color gradient pickers. */
export type ColorAxes = {
  xChannel: ColorChannel;
  yChannel: ColorChannel;
  zChannel: ColorChannel;
};

/** Numeric constraints for a single color channel, used to drive sliders and steppers. */
export interface ColorChannelRange {
  /** Minimum value of the channel. */
  minValue: number;
  /** Maximum value of the channel. */
  maxValue: number;
  /** Increment/decrement step (e.g. arrow key). */
  step: number;
  /** Larger increment/decrement step (e.g. page-up/down key). */
  pageSize: number;
}

/** Represents an immutable color value. All mutation methods return a new `Color` instance. */
export interface Color {
  /** Returns a new `Color` converted to `format`. */
  toFormat(format: ColorFormat): Color;
  /**
   * Serializes the color to a CSS string.
   * Defaults to `"css"` which produces the most browser-compatible form for each space
   * (`rgb(...)`, `hsla(...)`, etc.).
   */
  toString(format?: ColorFormat | "css"): string;
  /** Returns a deep clone of this color. */
  clone(): Color;
  /** Returns the RGB integer representation (`0xRRGGBB`), ignoring alpha. */
  toHexInt(): number;
  /**
   * Returns the numeric value for `channel`.
   * @throws if `channel` is not part of this color's space.
   */
  getChannelValue(channel: ColorChannel): number;
  /**
   * Returns a new `Color` with `channel` set to `value`.
   * @throws if `channel` is not part of this color's space.
   */
  withChannelValue(channel: ColorChannel, value: number): Color;
  /** Returns the {@link ColorChannelRange} for `channel` in this color space. */
  getChannelRange(channel: ColorChannel): ColorChannelRange;
  /** Returns a localized label for `channel` (e.g. `"Red"`, `"Saturation"`). */
  getChannelName(channel: ColorChannel, translations: ColorIntlTranslations): string;
  /** Returns `Intl.NumberFormatOptions` appropriate for displaying this channel's value. */
  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
  /** Returns the channel value formatted as a locale-aware string (e.g. `"50%"`, `"220°"`). */
  formatChannelValue(channel: ColorChannel): string;
  /** Returns the color space this color lives in. */
  getColorSpace(): ColorSpace;
  /**
   * Resolves the x/y/z channel assignment for a 2D color area picker.
   * Pass `xChannel` and/or `yChannel` to fix specific axes; the remaining
   * channel is inferred as the z axis.
   */
  getColorSpaceAxes(xyChannels: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes;
  /** Returns the three channel names for this color's space, in display order. */
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel];
  /**
   * Returns a human-readable color name derived from OKLCH analysis
   * (e.g. `"dark vibrant blue"`, `"pale cyan, 20% transparent"`).
   */
  getColorName(translations: ColorIntlTranslations): string;
  /** Returns just the hue family name (e.g. `"blue"`, `"orange yellow"`). */
  getHueName(translations: ColorIntlTranslations): string;
}
