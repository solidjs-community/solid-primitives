import { describe, test, expect } from "vitest";
import { computeFixedAspectHeight, computeFreeAspectHeight } from "../src/index.js";

describe("computeFixedAspectHeight", () => {
  test("returns zero with no width", () => {
    expect(computeFixedAspectHeight(0, 90, 3, 16/9)).toBe(0);
  });
  test("returns zero with no height", () => {
    expect(computeFixedAspectHeight(160, 0, 3, 16/9)).toBe(0);
  });
  test("returns zero with no items", () => {
    expect(computeFixedAspectHeight(160, 90, 0, 16/9)).toBe(0);
  });
  test("returns the height with one item in the same aspect", () => {
    expect(computeFixedAspectHeight(160, 90, 1, 16/9)).toBe(90);
  });
  test("returns a reduced height for a single item wider than the container", () => {
    expect(computeFixedAspectHeight(160, 100, 1, 16/9)).toBe(90);
  });
  test("returns the original height for a single item narrower than the container", () => {
    expect(computeFixedAspectHeight(160, 80, 1, 16/9)).toBe(80);
  });
  test("returns half the height for two items of the same aspect ratio", () => {
    expect(computeFixedAspectHeight(160, 90, 2, 16/9)).toBe(45);
  });
  test("returns half the height for three items of the same aspect ratio", () => {
    expect(computeFixedAspectHeight(160, 90, 3, 16/9)).toBe(45);
  });
  test("returns half the height for four items of the same aspect ratio", () => {
    expect(computeFixedAspectHeight(160, 90, 4, 16/9)).toBe(45);
  });
  test("returns third of the height for five items of the same aspect ratio", () => {
    expect(computeFixedAspectHeight(160, 90, 5, 16/9)).toBe(30);
  });
});

describe("computeFreeAspectHeight", () => {
  test("returns zero with no width", () => {
    expect(computeFreeAspectHeight(0, 90, [16/9, 16/9, 16/9])).toBe(0);
  });
  test("returns zero with no height", () => {
    expect(computeFreeAspectHeight(160, 0, [16/9, 16/9, 16/9])).toBe(0);
  });
  test("returns zero with no items", () => {
    expect(computeFreeAspectHeight(160, 90, [])).toBe(0);
  });
  test("returns the height with one item in the same aspect", () => {
    expect(computeFreeAspectHeight(160, 90, [16/9])).toBe(90);
  });
});
