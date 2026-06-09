import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { listArray } from "../src/index.js";

describe("listArray SSR", () => {
  test("maps array elements", () =>
    createRoot(dispose => {
      const result = listArray(
        () => [1, 2, 3],
        v => v() * 2,
      );
      expect(result()).toEqual([2, 4, 6]);
      dispose();
    }));

  test("renders fallback when empty", () =>
    createRoot(dispose => {
      const result = listArray<number, number | string>(
        () => [],
        v => v(),
        { fallback: () => "Empty" },
      );
      expect(result()).toEqual(["Empty"]);
      dispose();
    }));
});
