import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createAsyncMemo } from "../src";

describe("createAsyncMemo", () => {
  test("resolves synchronous functions", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const memo = createAsyncMemo(count);
      expect(count()).toBe(memo());
      setCount(1);
      expect(count()).toBe(memo());
      dispose();
    }));

  test("resolves asynchronous functions", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const memo = createAsyncMemo(
        () =>
          new Promise(res => {
            const n = count();
            setTimeout(() => res(n), 0);
          }),
      );
      expect(memo()).toBe(undefined);
      setCount(1);
      expect(memo()).toBe(undefined);
      setTimeout(() => {
        expect(count()).toBe(memo());
        dispose();
      }, 0);
    }));

  test("preserves order of execution", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let first = true;
      const memo = createAsyncMemo(
        () =>
          new Promise(res => {
            const n = count();
            if (first) {
              first = false;
              setTimeout(() => res(n), 100);
            } else {
              setTimeout(() => res(n), 0);
            }
          }),
      );
      setCount(1);
      setTimeout(() => {
        expect(memo()).toBe(1);
        dispose();
      }, 100);
    }));
});
