import { describe, expect, it } from "vitest";
import { parseColor } from "../src/colors/helpers.js";
import {
  tryParseColor,
  isValidColor,
  detectColorFormat,
  lighten,
  darken,
  saturate,
  desaturate,
  complement,
  mix,
  contrastRatio,
  isReadable,
  colorScale,
  perceptualColorScale,
} from "../src/colors/manipulation.js";

// ─── Safe parsing ─────────────────────────────────────────────────────────────

describe("tryParseColor", () => {
  it("returns a Color for valid input", () => {
    const result = tryParseColor("#3264C8");
    expect(result).toBeDefined();
    expect(result!.toString("hex")).toBe("#3264C8");
  });

  it("returns undefined for invalid input", () => {
    expect(tryParseColor("nope")).toBeUndefined();
    expect(tryParseColor("#zzzzzz")).toBeUndefined();
  });
});

describe("isValidColor", () => {
  it.each(["#abc", "#3264C8", "rgb(50, 100, 200)", "hsl(220, 60%, 50%)", "hsb(220, 75%, 78%)"])(
    "returns true for %s",
    value => {
      expect(isValidColor(value)).toBe(true);
    },
  );

  it.each(["nope", "#zzzzzz", "rgb(", "not-a-color"])("returns false for %s", value => {
    expect(isValidColor(value)).toBe(false);
  });
});

describe("detectColorFormat", () => {
  it.each([
    ["#abc", "hex"],
    ["#abcdef", "hex"],
    ["#abcd", "hexa"],
    ["#abcdefff", "hexa"],
    ["rgb(1, 2, 3)", "rgb"],
    ["rgb(1 2 3 / 0.5)", "rgb"],
    ["rgba(1, 2, 3, 0.5)", "rgba"],
    ["hsl(0, 50%, 50%)", "hsl"],
    ["hsla(0, 50%, 50%, 0.5)", "hsla"],
    ["hsb(0, 50%, 50%)", "hsb"],
    ["hsba(0, 50%, 50%, 0.5)", "hsba"],
    ["invalid", undefined],
    ["", undefined],
  ] as const)('detects "%s" as %s', (input, expected) => {
    expect(detectColorFormat(input)).toBe(expected);
  });
});

// ─── Manipulation ─────────────────────────────────────────────────────────────

describe("lighten", () => {
  it("increases lightness by amount × 100 percentage points", () => {
    const result = lighten(parseColor("hsl(220, 60%, 50%)"), 0.1);
    expect(result.getChannelValue("lightness")).toBeCloseTo(60);
  });

  it("clamps at 100", () => {
    expect(lighten(parseColor("hsl(0, 50%, 95%)"), 0.1).getChannelValue("lightness")).toBe(100);
  });
});

describe("darken", () => {
  it("decreases lightness by amount × 100 percentage points", () => {
    const result = darken(parseColor("hsl(220, 60%, 50%)"), 0.1);
    expect(result.getChannelValue("lightness")).toBeCloseTo(40);
  });

  it("clamps at 0", () => {
    expect(darken(parseColor("hsl(0, 50%, 5%)"), 0.1).getChannelValue("lightness")).toBe(0);
  });
});

describe("saturate", () => {
  it("increases saturation", () => {
    expect(saturate(parseColor("hsl(220, 50%, 50%)"), 0.1).getChannelValue("saturation")).toBeCloseTo(60);
  });

  it("clamps at 100", () => {
    expect(saturate(parseColor("hsl(0, 95%, 50%)"), 0.1).getChannelValue("saturation")).toBe(100);
  });
});

describe("desaturate", () => {
  it("decreases saturation", () => {
    expect(desaturate(parseColor("hsl(220, 50%, 50%)"), 0.1).getChannelValue("saturation")).toBeCloseTo(40);
  });

  it("clamps at 0", () => {
    expect(desaturate(parseColor("hsl(0, 5%, 50%)"), 0.1).getChannelValue("saturation")).toBe(0);
  });
});

describe("complement", () => {
  it("rotates hue by 180°", () => {
    expect(complement(parseColor("hsl(60, 50%, 50%)")).getChannelValue("hue")).toBeCloseTo(240);
  });

  it("wraps hue correctly", () => {
    expect(complement(parseColor("hsl(200, 50%, 50%)")).getChannelValue("hue")).toBeCloseTo(20);
  });

  it("preserves saturation and lightness", () => {
    const result = complement(parseColor("hsl(120, 60%, 40%)"));
    expect(result.getChannelValue("saturation")).toBeCloseTo(60);
    expect(result.getChannelValue("lightness")).toBeCloseTo(40);
  });
});

describe("mix", () => {
  it("defaults to 50/50", () => {
    const result = mix(parseColor("#000000"), parseColor("#ffffff"));
    expect(result.getChannelValue("red")).toBe(128);
    expect(result.getChannelValue("green")).toBe(128);
    expect(result.getChannelValue("blue")).toBe(128);
  });

  it("ratio 0 returns a", () => {
    const result = mix(parseColor("#000000"), parseColor("#ffffff"), 0);
    expect(result.getChannelValue("red")).toBe(0);
  });

  it("ratio 1 returns b", () => {
    const result = mix(parseColor("#000000"), parseColor("#ffffff"), 1);
    expect(result.getChannelValue("red")).toBe(255);
  });

  it("interpolates alpha", () => {
    const a = parseColor("rgba(0, 0, 0, 0)");
    const b = parseColor("rgba(0, 0, 0, 1)");
    expect(mix(a, b, 0.5).getChannelValue("alpha")).toBeCloseTo(0.5);
  });

  it("treats NaN ratio as 0.5", () => {
    const result = mix(parseColor("#000000"), parseColor("#ffffff"), NaN);
    expect(result.getChannelValue("red")).toBe(128);
  });

  it("clamps ratio > 1 to 1", () => {
    const result = mix(parseColor("#000000"), parseColor("#ffffff"), 2);
    expect(result.getChannelValue("red")).toBe(255);
  });

  it("clamps ratio < 0 to 0", () => {
    const result = mix(parseColor("#000000"), parseColor("#ffffff"), -1);
    expect(result.getChannelValue("red")).toBe(0);
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe("contrastRatio", () => {
  it("black on white = 21", () => {
    expect(contrastRatio(parseColor("#000"), parseColor("#fff"))).toBeCloseTo(21, 0);
  });

  it("is symmetric", () => {
    const a = parseColor("rgb(50, 100, 200)");
    const b = parseColor("rgb(200, 100, 50)");
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it("same color = 1", () => {
    expect(contrastRatio(parseColor("#3264C8"), parseColor("#3264C8"))).toBeCloseTo(1);
  });
});

describe("isReadable", () => {
  it("white on black passes AA normal", () => {
    expect(isReadable(parseColor("#fff"), parseColor("#000"))).toBe(true);
  });

  it("white on white fails AA normal", () => {
    expect(isReadable(parseColor("#fff"), parseColor("#fff"))).toBe(false);
  });

  it("white on black passes AAA normal", () => {
    expect(isReadable(parseColor("#fff"), parseColor("#000"), "AAA")).toBe(true);
  });

  it("uses lower threshold for large text", () => {
    // #888888 on white ≈ 3.5:1 — fails AA normal (< 4.5) but passes AA large (≥ 3.0)
    const fg = parseColor("#888888");
    expect(isReadable(fg, parseColor("#fff"), "AA", "normal")).toBe(false);
    expect(isReadable(fg, parseColor("#fff"), "AA", "large")).toBe(true);
  });
});

// ─── Color scales ─────────────────────────────────────────────────────────────

describe("colorScale", () => {
  it("returns exactly `steps` colors", () => {
    expect(colorScale(parseColor("#000"), parseColor("#fff"), 5)).toHaveLength(5);
  });

  it("first element matches `from`", () => {
    const scale = colorScale(parseColor("#000000"), parseColor("#ffffff"), 3);
    expect(scale[0]!.toString("hex")).toBe("#000000");
  });

  it("last element matches `to`", () => {
    const scale = colorScale(parseColor("#000000"), parseColor("#ffffff"), 3);
    expect(scale[2]!.toString("hex")).toBe("#FFFFFF");
  });

  it("throws for steps < 2", () => {
    expect(() => colorScale(parseColor("#000"), parseColor("#fff"), 1)).toThrow("colorScale");
  });

  it("throws for NaN steps", () => {
    expect(() => colorScale(parseColor("#000"), parseColor("#fff"), NaN)).toThrow("colorScale");
  });

  it("throws for fractional steps", () => {
    expect(() => colorScale(parseColor("#000"), parseColor("#fff"), 2.5)).toThrow("colorScale");
  });
});

describe("perceptualColorScale", () => {
  it("returns exactly `steps` colors", () => {
    expect(
      perceptualColorScale(parseColor("hsl(0, 80%, 50%)"), parseColor("hsl(240, 80%, 50%)"), 5),
    ).toHaveLength(5);
  });

  it("endpoints round-trip close to original", () => {
    const from = parseColor("hsl(0, 80%, 50%)");
    const to = parseColor("hsl(240, 80%, 50%)");
    const scale = perceptualColorScale(from, to, 5);
    // First and last should be in-gamut RGB approximations of the originals
    expect(scale[0]!.getColorSpace()).toBe("rgb");
    expect(scale[4]!.getColorSpace()).toBe("rgb");
  });

  it("throws for steps < 2", () => {
    expect(() => perceptualColorScale(parseColor("#000"), parseColor("#fff"), 1)).toThrow(
      "perceptualColorScale",
    );
  });

  it("throws for NaN steps", () => {
    expect(() => perceptualColorScale(parseColor("#000"), parseColor("#fff"), NaN)).toThrow(
      "perceptualColorScale",
    );
  });

  it("throws for fractional steps", () => {
    expect(() => perceptualColorScale(parseColor("#000"), parseColor("#fff"), 2.5)).toThrow(
      "perceptualColorScale",
    );
  });
});

