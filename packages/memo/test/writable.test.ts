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
      const [result, setResult] = createWritableMemo(
        (p?: number) => ((prevCb = p), count() * 2),
        -2,
      );
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

  test("value can be overwritten twice to the same value", () =>
    createRoot(dispose => {
      const [source, setSource] = createSignal(1);
      const [memo, setMemo] = createWritableMemo(source, -2);
      expect(memo()).toBe(source());
      setMemo(-2);
      expect(memo()).toBe(-2);
      setSource(5);
      expect(memo()).toBe(source());
      setMemo(-2);
      expect(memo()).toBe(-2);
      dispose();
    }));

  // https://github.com/solidjs-community/solid-primitives/issues/772
  test("issue 772", () => {
    const [source, setSource] = createSignal(0);
    const [[value, setValue], dispose] = createRoot(dispose => [
      createWritableMemo(() => !!source()),
      dispose,
    ]);

    expect(value()).toBe(false);

    setSource(1);
    expect(value()).toBe(true);

    setValue(false);
    expect(value()).toBe(false);

    setSource(2);
    expect(value()).toBe(true);

    dispose();
  });
});
