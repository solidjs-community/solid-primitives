import { describe, test, expect } from "vitest";
import { createMemo, createRoot, createSignal } from "solid-js";
import { listArray } from "../src/index.js";

describe("listArray", () => {
  test("simple listArray", () => {
    createRoot(() => {
      const [s] = createSignal([1, 2, 3, 4]),
        r = listArray(s, v => v() * 2);
      expect(r()).toEqual([2, 4, 6, 8]);
    });
  });

  test("show fallback", () => {
    createRoot(() => {
      const [s, set] = createSignal([1, 2, 3, 4]),
        double = listArray<number, number | string>(s, v => v() * 2, {
          fallback: () => "Empty",
        }),
        r = createMemo(double);
      expect(r()).toEqual([2, 4, 6, 8]);
      set([]);
      expect(r()).toEqual(["Empty"]);
      set([3, 4, 5]);
      expect(r()).toEqual([6, 8, 10]);
    });
  });
});
