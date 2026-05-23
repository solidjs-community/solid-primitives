import { describe, test, expect } from "vitest";
import { createEffect, createRoot, createSignal, flush } from "solid-js";
import { createLatest, createLatestMany } from "../src/index.js";

describe("createLatest", () => {
  test("should return the latest value", () => {
    const [a, setA] = createSignal({ a: 1 });
    const [b, setB] = createSignal({ b: 2 });
    const { latest, dispose } = createRoot(d => ({
      latest: createLatest([a, b]),
      dispose: d,
    }));

    flush();
    expect(latest()).toEqual({ b: 2 });

    setA({ a: 3 });
    flush();
    expect(latest()).toEqual({ a: 3 });

    setB({ b: 4 });
    flush();
    expect(latest()).toEqual({ b: 4 });

    // when both updated in the same tick, last write wins
    setB({ b: 5 });
    setA({ a: 6 });
    flush();
    expect(latest()).toEqual({ a: 6 });

    setB({ b: 7 });
    flush();
    expect(latest()).toEqual({ b: 7 });

    // consecutive updates — last write wins
    setB({ b: 8 });
    setA({ a: 9 });
    flush();
    expect(latest()).toEqual({ a: 9 });

    dispose();
  });

  test("works with equals: false sources", () => {
    const [a, setA] = createSignal(0, { equals: false });
    const [b, setB] = createSignal("b");
    let captured: any;

    const dispose = createRoot(d => {
      const latest = createLatest([a, b]);
      createEffect(
        () => latest(),
        value => {
          captured = value;
        },
      );
      return d;
    });

    flush();
    expect(captured).toBe("b");
    captured = undefined;

    setA(1);
    flush();
    expect(captured).toBe(1);
    captured = undefined;

    setB("c");
    flush();
    expect(captured).toBe("c");
    captured = undefined;

    setA(1);
    flush();
    expect(captured).toBe(1);

    dispose();
  });

  test("equals options", () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal("b");

    const { latest, dispose } = createRoot(d => ({
      latest: createLatest([a, b], {
        equals: (a, b) => typeof b === "number",
      }),
      dispose: d,
    }));

    flush();
    expect(latest()).toBe("b");

    setA(1);
    flush();
    expect(latest()).toBe("b");

    setB("c");
    flush();
    expect(latest()).toBe("c");

    setA(2);
    flush();
    expect(latest()).toBe("c");

    setB("d");
    flush();
    expect(latest()).toBe("d");

    dispose();
  });
});

describe("createLatestMany", () => {
  test("should return the latest values", () => {
    const [a, setA] = createSignal({ a: 1 });
    const [b, setB] = createSignal({ b: 2 });
    const { latest, dispose } = createRoot(d => ({
      latest: createLatestMany([a, b]),
      dispose: d,
    }));

    // initial: both dirty
    expect(latest()).toEqual([{ a: 1 }, { b: 2 }]);

    setA({ a: 3 });
    flush();
    expect(latest()).toEqual([{ a: 3 }]);

    setB({ b: 4 });
    flush();
    expect(latest()).toEqual([{ b: 4 }]);

    // both updated — both in array order
    setB({ b: 5 });
    setA({ a: 6 });
    flush();
    expect(latest()).toEqual([{ a: 6 }, { b: 5 }]);

    setB({ b: 7 });
    flush();
    expect(latest()).toEqual([{ b: 7 }]);

    // consecutive updates — both show up in source order
    setB({ b: 8 });
    setA({ a: 9 });
    flush();
    expect(latest()).toEqual([{ a: 9 }, { b: 8 }]);

    dispose();
  });

  test("works with equals: false sources", () => {
    const [a, setA] = createSignal(0, { equals: false });
    const [b, setB] = createSignal("b");
    let captured: any;

    const dispose = createRoot(d => {
      const latest = createLatestMany([a, b]);
      createEffect(
        () => latest(),
        value => {
          captured = value;
        },
      );
      return d;
    });

    flush();
    expect(captured).toEqual([0, "b"]);
    captured = undefined;

    setA(1);
    flush();
    expect(captured).toEqual([1]);
    captured = undefined;

    setB("c");
    flush();
    expect(captured).toEqual(["c"]);
    captured = undefined;

    setA(1);
    flush();
    expect(captured).toEqual([1]);

    dispose();
  });
});
