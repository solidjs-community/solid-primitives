import { describe, test, expect } from "vitest";
import { createWritableMemo } from "../src/index.js";
import { createRoot, createSignal, flush } from "solid-js";

describe("createWritableMemo", () => {
  test("behaves like a memo", () => {
    const [count, setCount] = createSignal(1);
    const result = createRoot(d => {
      const [result] = createWritableMemo(() => count() * 2);
      return result;
    });
    flush();
    expect(result()).toBe(2);
    setCount(5);
    flush();
    expect(result()).toBe(10);
  });

  test("value can be overwritten", () => {
    const [count, setCount] = createSignal(1);
    const { result, setResult, dispose } = createRoot(d => {
      const [result, setResult] = createWritableMemo(() => count() * 2);
      return { result, setResult, dispose: d };
    });
    flush();
    expect(result()).toBe(2);
    setResult(5);
    flush();
    expect(result()).toBe(5);
    setCount(5);
    flush();
    expect(result()).toBe(10);
    setCount(7);
    flush();
    setResult(3);
    flush();
    expect(result()).toBe(3);
    dispose();
  });

  test("consistency of previous value in the callbacks", () => {
    const [count, setCount] = createSignal(1);
    let prevCb: number | undefined;
    const { result, setResult, dispose } = createRoot(d => {
      const [result, setResult] = createWritableMemo(
        (p?: number) => ((prevCb = p), count() * 2),
        -2,
      );
      return { result, dispose: d, setResult };
    });
    flush();
    expect(prevCb).toBe(-2);
    expect(result()).toBe(2);

    setResult(p => {
      expect(p).toBe(2);
      return 5;
    });
    flush();
    expect(result()).toBe(5);
    expect(prevCb).toBe(-2);

    setCount(5);
    flush();
    expect(result()).toBe(10);
    expect(prevCb).toBe(5);

    setCount(7);
    flush();
    expect(prevCb).toBe(10);
    setResult(p => {
      expect(p).toBe(14);
      return 3;
    });
    flush();
    expect(result()).toBe(3);
    dispose();
  });

  test("updating and reading consecutively", () => {
    const [source, setSource] = createSignal(1);
    const { memo, setMemo, dispose } = createRoot(d => {
      const [memo, setMemo] = createWritableMemo(source, -2);
      return { memo, setMemo, dispose: d };
    });

    setSource(2);
    flush();
    expect(memo()).toBe(2);

    setMemo(-3);
    flush();
    expect(memo()).toBe(-3);

    dispose();
  });

  test("return value of setter equals the new value", () => {
    const [source] = createSignal(1);
    const { memo, setMemo, dispose } = createRoot(d => {
      const [memo, setMemo] = createWritableMemo(source, -2);
      return { memo, setMemo, dispose: d };
    });

    flush();
    expect(setMemo(5)).toBe(5);
    flush();
    expect(memo()).toBe(5);
    expect(setMemo(v => v + 1)).toBe(6);
    flush();

    dispose();
  });

  test("value can be overwritten twice to the same value", () => {
    const [source, setSource] = createSignal(1);
    const { memo, setMemo, dispose } = createRoot(d => {
      const [memo, setMemo] = createWritableMemo(source, -2);
      return { memo, setMemo, dispose: d };
    });

    flush();
    expect(memo()).toBe(1);
    setMemo(-2);
    flush();
    expect(memo()).toBe(-2);
    setSource(5);
    flush();
    expect(memo()).toBe(5);
    setMemo(-2);
    flush();
    expect(memo()).toBe(-2);
    dispose();
  });

  // https://github.com/solidjs-community/solid-primitives/issues/772
  test("issue 772", () => {
    const [source, setSource] = createSignal(0);
    const { value, setValue, dispose } = createRoot(d => {
      const [value, setValue] = createWritableMemo(() => !!source());
      return { value, setValue, dispose: d };
    });

    flush();
    expect(value()).toBe(false);

    setSource(1);
    flush();
    expect(value()).toBe(true);

    setValue(false);
    flush();
    expect(value()).toBe(false);

    setSource(2);
    flush();
    expect(value()).toBe(true);

    dispose();
  });
});
