import { describe, it, expect } from "vitest";
import {
  precisionRound,
  snapToStep,
  inverseLerp,
  lerp,
  logScale,
  inverseLogScale,
} from "../src/math";

describe("Range & Numeric Precision Math", () => {
  it("eliminates floating-point addition errors", () => {
    const buggySum = 0.1 + 0.2;
    expect(precisionRound(buggySum, 4)).toBe(0.3);
  });

  it("snaps to fractional step boundaries cleanly", () => {
    expect(snapToStep(0.28, 0.1, 0)).toBe(0.3);
    expect(snapToStep(0.22, 0.1, 0)).toBe(0.2);
    expect(snapToStep(1.234, 0.05, 1)).toBe(1.25);
  });

  it("performs linear interpolation and inverse normalization", () => {
    expect(lerp(100, 200, 0.5)).toBe(150);
    expect(inverseLerp(100, 200, 150)).toBe(0.5);
  });

  it("correctly maps logarithmic audio slider curves", () => {
    const minHz = 20;
    const maxHz = 20000;
    const midpoint = logScale(minHz, maxHz, 0.5);
    expect(Math.round(midpoint)).toBe(632);
    expect(inverseLogScale(minHz, maxHz, midpoint)).toBeCloseTo(0.5, 4);
  });
});
