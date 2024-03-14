import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { listArray } from "../src/index.js";

describe("listArray", () => {
  test("creates signal for value and index", () => {
    const { setArr, dispose, list } = createRoot(dispose => {
      const [arr, setArr] = createSignal<number[]>([]);
      const list = listArray(arr, (v, i) => ({ v: v(), i: i() }));
      return { setArr, dispose, list };
    });

    dispose();
  });
});
