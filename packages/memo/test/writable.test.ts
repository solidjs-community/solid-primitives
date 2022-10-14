import { describe, test, expect } from "vitest";
import { createWritableMemo } from "../src";
import { createRoot, createSignal } from "solid-js";

describe("createWritableMemo", () => {
  test("behaves like a memo", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(1);
      const [result] = createWritableMemo(() => count() * 2);
      expect(result()).toBe(count() * 2);
      setCount(5);
      expect(result()).toBe(count() * 2);
      dispose();
    }));

  test("value can be overwritten", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(1);
      const [result, setResult] = createWritableMemo(() => count() * 2);
      expect(result()).toBe(count() * 2);
      setResult(5);
      expect(result()).toBe(5);
      setCount(5);
      expect(result()).toBe(count() * 2);
      setCount(7);
      setResult(3);
      expect(result()).toBe(3);
      dispose();
    }));
});
