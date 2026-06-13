/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright Fabien Marie-Louise.
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/colors
 */

/**
 * Default English translations for color channel names, descriptors, and hue families.
 * Pass this object (or a translated equivalent) to {@link Color.getColorName} and
 * {@link Color.getHueName} to produce human-readable, accessible color labels.
 *
 * @example
 * ```ts
 * import { parseColor, COLOR_INTL_TRANSLATIONS } from "@solid-primitives/utils/colors";
 *
 * const color = parseColor("hsl(220 60% 49%)");
 * color.getColorName(COLOR_INTL_TRANSLATIONS); // "dark vibrant blue"
 * color.getHueName(COLOR_INTL_TRANSLATIONS);   // "blue"
 * ```
 */
export const COLOR_INTL_TRANSLATIONS = {
  // Channel names
  hue: "Hue",
  saturation: "Saturation",
  lightness: "Lightness",
  brightness: "Brightness",
  red: "Red",
  green: "Green",
  blue: "Blue",
  alpha: "Alpha",

  // Full color name composers
  colorName: (lightness: string, chroma: string, hue: string) => `${lightness} ${chroma} ${hue}`,
  transparentColorName: (
    lightness: string,
    chroma: string,
    hue: string,
    percentTransparent: string,
  ) => `${lightness} ${chroma} ${hue}, ${percentTransparent} transparent`,

  // Lightness descriptors
  "very dark": "very dark",
  dark: "dark",
  light: "light",
  "very light": "very light",

  // Chroma descriptors
  pale: "pale",
  grayish: "grayish",
  vibrant: "vibrant",

  // Achromatic
  black: "black",
  white: "white",
  gray: "gray",

  // Hue families (in OKLCH hue order).
  // Note: "red", "green", "blue" are intentionally absent — the channel name
  // entries above ("Red", "Green", "Blue") serve as their hue family labels too.
  pink: "pink",
  "pink red": "pink red",
  "red orange": "red orange",
  brown: "brown",
  orange: "orange",
  "orange yellow": "orange yellow",
  "brown yellow": "brown yellow",
  yellow: "yellow",
  "yellow green": "yellow green",
  "green cyan": "green cyan",
  cyan: "cyan",
  "cyan blue": "cyan blue",
  "blue purple": "blue purple",
  purple: "purple",
  "purple magenta": "purple magenta",
  magenta: "magenta",
  "magenta pink": "magenta pink",
};

export type ColorIntlTranslations = typeof COLOR_INTL_TRANSLATIONS;
