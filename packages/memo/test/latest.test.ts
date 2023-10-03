import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot, createSignal } from "solid-js";
import { createLatest, createLatestMany } from "../src/index.js";

describe("createLatest", () => {
  test("should return the latest value", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal({ a: 1 });
      const [b, setB] = createSignal({ b: 2 });
      const latest = createLatest([a, b]);
      expect(latest()).toEqual({ b: 2 });
      setA({ a: 3 });
      expect(latest()).toEqual({ a: 3 });
      setB({ b: 4 });
      expect(latest()).toEqual({ b: 4 });
      setB({ b: 5 });
      setA({ a: 6 });
      expect(latest()).toEqual({ a: 6 });
      setB({ b: 7 });
      expect(latest()).toEqual({ b: 7 });
      batch(() => {
        setB({ b: 8 });
        setA({ a: 9 });
        expect(latest()).toEqual({ b: 8 });
      });
      expect(latest()).toEqual({ b: 8 });
      dispose();
    });
  });

  test("works with equals: false sources", () => {
    const [a, setA] = createSignal(0, { equals: false });
    const [b, setB] = createSignal("b");
    let captured: any;

    const dispose = createRoot(dispose => {
      const latest = createLatest([a, b]);
      createEffect(() => {
        captured = latest();
      });
      return dispose;
    });

    expect(captured).toBe("b");
    captured = undefined;

    setA(1);
    expect(captured).toBe(1);
    captured = undefined;

    setB("c");
    expect(captured).toBe("c");
    captured = undefined;

    setA(1);
    expect(captured).toBe(1);

    dispose();
  });

  test("equals options", () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal("b");

    const { latest, dispose } = createRoot(dispose => {
      return {
        latest: createLatest([a, b], {
          equals: (a, b) => typeof b === "number",
        }),
        dispose,
      };
    });

    expect(latest()).toBe("b");

    setA(1);
    expect(latest()).toBe("b");

    setB("c");
    expect(latest()).toBe("c");

    setA(2);
    expect(latest()).toBe("c");

    setB("d");
    expect(latest()).toBe("d");

    dispose();
  });
});

describe("createLatestMany", () => {
  test("should return the latest values", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal({ a: 1 });
      const [b, setB] = createSignal({ b: 2 });
      const latest = createLatestMany([a, b]);
      expect(latest()).toEqual([{ a: 1 }, { b: 2 }]);
      setA({ a: 3 });
      expect(latest()).toEqual([{ a: 3 }]);
      setB({ b: 4 });
      expect(latest()).toEqual([{ b: 4 }]);
      setB({ b: 5 });
      setA({ a: 6 });
      expect(latest()).toEqual([{ a: 6 }, { b: 5 }]);
      setB({ b: 7 });
      expect(latest()).toEqual([{ b: 7 }]);
      batch(() => {
        setB({ b: 8 });
        setA({ a: 9 });
        expect(latest()).toEqual([{ a: 9 }, { b: 8 }]);
      });
      expect(latest()).toEqual([{ a: 9 }, { b: 8 }]);
      dispose();
    });
  });

  test("works with equals: false sources", () => {
    const [a, setA] = createSignal(0, { equals: false });
    const [b, setB] = createSignal("b");
    let captured: any;

    const dispose = createRoot(dispose => {
      const latest = createLatestMany([a, b]);
      createEffect(() => {
        captured = latest();
      });
      return dispose;
    });

    expect(captured).toEqual([0, "b"]);
    captured = undefined;

    setA(1);
    expect(captured).toEqual([1]);
    captured = undefined;

    setB("c");
    expect(captured).toEqual(["c"]);
    captured = undefined;

    setA(1);
    expect(captured).toEqual([1]);

    dispose();
  });
});
