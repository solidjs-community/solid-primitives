import { createRoot, createSignal } from "solid-js";
import { describe, test, expect } from "vitest";
import { listArray } from "../src/index.js";

describe("description", () => {
  test("doesn't break in SSR", () => {
    const { setArr, dispose, list } = createRoot(dispose => {
      const [arr, setArr] = createSignal<number[]>([]);
      const list = listArray(arr, (v, i) => ({ v: v(), i: i() }));
      return { setArr, dispose, list };
    });

    dispose();
  });
});
