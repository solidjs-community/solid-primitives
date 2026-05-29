import { describe, test, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createMemoCache } from "../src/index.js";

describe("createMemoCache", () => {
  test("cashes values by key", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    const { result, dispose } = createRoot(d => ({
      result: createMemoCache(count, n => {
        runs++;
        return n;
      }),
      dispose: d,
    }));

    expect(runs).toBe(0);
    expect(result()).toBe(0);
    expect(runs).toBe(1);

    setCount(1);
    flush();
    expect(runs).toBe(1);
    expect(result()).toBe(1);
    expect(runs).toBe(2);

    setCount(0);
    flush();
    expect(runs).toBe(2);
    expect(result()).toBe(0);
    expect(runs).toBe(2);

    setCount(1);
    flush();
    expect(runs).toBe(2);
    expect(result()).toBe(1);
    expect(runs).toBe(2);

    dispose();
  });

  test("passing key to access function", () =>
    createRoot(dispose => {
      let runs = 0;
      const result = createMemoCache((n: number) => {
        runs++;
        return n;
      });

      expect(runs).toBe(0);
      expect(result(0)).toBe(0);
      expect(runs).toBe(1);

      expect(result(1)).toBe(1);
      expect(runs).toBe(2);

      expect(result(0)).toBe(0);
      expect(runs).toBe(2);

      expect(result(1)).toBe(1);
      expect(runs).toBe(2);

      dispose();
    }));

  test("reactive signal dependency", () => {
    const [dep, setDep] = createSignal(0);
    let runs = 0;
    const { result, dispose } = createRoot(d => ({
      result: createMemoCache((n: number) => {
        runs++;
        return n + dep();
      }),
      dispose: d,
    }));

    expect(runs).toBe(0);
    expect(result(0)).toBe(0);
    expect(runs).toBe(1);

    expect(result(1)).toBe(1);
    expect(runs).toBe(2);

    expect(result(0)).toBe(0);
    expect(runs).toBe(2);

    expect(result(1)).toBe(1);
    expect(runs).toBe(2);

    setDep(1);
    expect(runs).toBe(2);
    flush();
    expect(result(0)).toBe(1);
    expect(result(1)).toBe(2);
    expect(runs).toBe(4);

    dispose();
  });

  test("limit cache size", () =>
    createRoot(dispose => {
      let runs = 0;
      const result = createMemoCache(
        (n: number) => {
          runs++;
          return n;
        },
        { size: 1 },
      );

      expect(runs).toBe(0);
      expect(result(0)).toBe(0);
      expect(runs).toBe(1);

      expect(result(1)).toBe(1);
      expect(runs).toBe(2);

      expect(result(0)).toBe(0);
      expect(runs).toBe(2);

      expect(result(1)).toBe(1);
      expect(runs).toBe(3);

      dispose();
    }));
});
