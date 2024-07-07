import { describe, test, expect } from "vitest";
import { createWritableMemo } from "../src/index.js";
import { batch, createRoot, createSignal } from "solid-js";

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

  test("consistency of previous value in the callbacks", () => {
    const [count, setCount] = createSignal(1);
    let prevCb: number | undefined;
    const { result, setResult, dispose } = createRoot(dispose => {
      const [result, setResult] = createWritableMemo(p => ((prevCb = p), count() * 2), -2);
      expect(prevCb).toBe(-2);
      expect(result()).toBe(2);
      return { result, dispose, setResult };
    });
    setResult(p => {
      expect(p).toBe(2);
      return 5;
    });
    expect(result()).toBe(5);
    expect(prevCb).toBe(-2);
    setCount(5);
    expect(result()).toBe(count() * 2);
    expect(prevCb).toBe(5);
    setCount(7);
    expect(prevCb).toBe(10);
    setResult(p => {
      expect(p).toBe(14);
      return 3;
    });
    expect(result()).toBe(3);
    dispose();
  });

  test("updating and reading in a batch", () => {
    createRoot(dispose => {
      const [source, setSource] = createSignal(1);
      const [memo, setMemo] = createWritableMemo(source, -2);

      batch(() => {
        setSource(2);
        expect(memo()).toBe(2);
      });

      batch(() => {
        setMemo(-3);
        expect(memo()).toBe(-3);
      });

      dispose();
    });
  });

  test("return value of setter equals the new value", () => {
    createRoot(dispose => {
      const [source] = createSignal(1);
      const [memo, setMemo] = createWritableMemo(source, -2);

      expect(setMemo(5)).toBe(5);
      expect(memo()).toBe(5);
      expect(setMemo(v => v + 1)).toBe(6);

      dispose();
    });
  });

  test("memo can be reassigned to default inner signal", () => {
    createRoot(dispose => {
      const [signal, setSignal] = createSignal(1);
      const [memo, setMemo] = createWritableMemo<number | undefined>(() => signal() * 2);

      setMemo(2);
      expect(memo()).toBe(2);
      setSignal(2);
      expect(memo()).toBe(4);
      setMemo(2);
      expect(memo()).toBe(2);

      dispose();
    });
  });

  test("memo can be reassigned to previous inner signal value", () => {
    createRoot(dispose => {
      const [signal, setSignal] = createSignal(1);
      const [memo, setMemo] = createWritableMemo<number | undefined>(() => signal() * 2);

      setMemo(2);
      expect(memo()).toBe(2);
      setSignal(2);
      expect(memo()).toBe(4);
      setMemo(2);
      expect(memo()).toBe(2);

      dispose();
    });
  });
});
