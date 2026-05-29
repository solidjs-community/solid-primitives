import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { repeat, mapRange, indexRange } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  it("repeat() - SSR", () =>
    createRoot(dispose => {
      const mapped = repeat(
        () => 3,
        i => i,
      );
      expect(mapped()).toEqual([0, 1, 2]);
      dispose();
    }));

  it("mapRange() - SSR", () =>
    createRoot(dispose => {
      const mapped = mapRange(
        () => 0,
        () => 3,
        () => 1,
        n => n,
      );
      expect(mapped()).toEqual([0, 1, 2]);
      dispose();
    }));

  it("indexRange() - SSR", () =>
    createRoot(dispose => {
      const mapped = indexRange(
        () => 0,
        () => 3,
        () => 1,
        n => n(),
      );
      expect(mapped()).toEqual([0, 1, 2]);
      dispose();
    }));
});
