import { describe, expect, it } from "vitest";
import type { ColorChannel } from "../src/colors/types.js";
import { parseColor, normalizeHue, getColorChannels } from "../src/colors/helpers.js";

const rgbValues = [
  { raw: "rgb(50 100 200)", alpha: false, string: "rgb(50, 100, 200)" },
  { raw: "rgb(50 100 200 / 0.2)", alpha: true, string: "rgb(50, 100, 200 / 0.2)" },
  { raw: "rgb(50 100 200 / 20%)", alpha: true, string: "rgb(50, 100, 200 / 0.2)" },
  { raw: "rgba(50, 100, 200, 0.2)", alpha: true, string: "rgb(50, 100, 200 / 0.2)" },
  { raw: "rgb(50, 100, 200)", alpha: false, string: "rgb(50, 100, 200)" },
  { raw: "rgb(50,100,200)", alpha: false, string: "rgb(50, 100, 200)" },
];

describe("parseColor", () => {
  describe("RGBColor", () => {
    it.each(rgbValues)("parses %s to rgb color space", item => {
      const result = parseColor(item.raw);
      expect(result.getColorSpace()).toBe("rgb");
      expect(result.getColorChannels()).toStrictEqual<[ColorChannel, ColorChannel, ColorChannel]>([
        "red",
        "green",
        "blue",
      ]);
    });

    it.each(rgbValues)("toString returns correct string for %s", item => {
      expect(parseColor(item.raw).toString()).toBe(item.string);
    });

    it("converts rgb to hex", () => {
      expect(parseColor("rgb(0 0 0)").toString("hex")).toBe("#000000");
    });

    it("converts rgb with alpha to hexa", () => {
      expect(parseColor("rgb(0 0 0 / 0.5)").toString("hexa")).toBe("#00000080");
    });

    it("converts rgb to hsl", () => {
      expect(parseColor("rgb(50 100 200)").toFormat("hsl").toString("hsl")).toBe(
        "hsl(220 60% 49.02%)",
      );
    });

    it("converts rgb with alpha to hsla", () => {
      expect(parseColor("rgb(50 100 200 / 0.5)").toFormat("hsla").toString("hsla")).toBe(
        "hsla(220 60% 49.02% / 0.5)",
      );
    });

    it.each(rgbValues)("round-trips through all formats for %s", item => {
      const result = parseColor(item.raw);

      expect(result.getColorSpace()).toBe("rgb");
      expect(result.getColorChannels()).toStrictEqual<[ColorChannel, ColorChannel, ColorChannel]>([
        "red",
        "green",
        "blue",
      ]);
      expect(result.toString()).toBe(item.string);

      if (!item.alpha) {
        expect(result.toString("hex")).toBe("#3264C8");
      }
      if (item.alpha) {
        expect(result.toString("hexa")).toBe("#3264C833");
      }

      const hslResult = result.toFormat("hsl");
      if (item.alpha) {
        expect(hslResult.toString("hsl")).toBe("hsl(220 60% 49.02% / 0.2)");
        expect(result.toFormat("hsla").toString("hsla")).toBe("hsla(220 60% 49.02% / 0.2)");
      } else {
        expect(hslResult.toString("hsl")).toBe("hsl(220 60% 49.02%)");
      }

      expect(result.toFormat("hsb").toString("hsb")).toBe("hsb(220 75% 78.43%)");
      if (item.alpha) {
        expect(result.toFormat("hsba").toString("hsba")).toBe("hsba(220 75% 78.43% 0.2)");
      }
    });

    it("throws for invalid color strings", () => {
      expect(() => parseColor("invalid")).toThrowError("Invalid color value: invalid");
      expect(() => parseColor("#zzzzzz")).toThrowError("Invalid color value: #zzzzzz");
    });

    it("handles alpha = 0", () => {
      expect(parseColor("rgb(50 100 200 / 0)").toFormat("hsba").toString("hsba")).toBe(
        "hsba(220 75% 78.43% 0)",
      );
    });
  });

  describe("normalizeHue", () => {
    it("keeps 360 as-is", () => {
      expect(normalizeHue(360)).toBe(360);
    });

    it("wraps negative hues", () => {
      expect(normalizeHue(-10)).toBe(350);
    });

    it("wraps hues over 360", () => {
      expect(normalizeHue(370)).toBe(10);
    });
  });

  describe("getColorChannels", () => {
    it("returns rgb channels", () => {
      expect(getColorChannels("rgb")).toStrictEqual(["red", "green", "blue"]);
    });

    it("returns hsl channels", () => {
      expect(getColorChannels("hsl")).toStrictEqual(["hue", "saturation", "lightness"]);
    });

    it("returns hsb channels", () => {
      expect(getColorChannels("hsb")).toStrictEqual(["hue", "saturation", "brightness"]);
    });
  });
});
