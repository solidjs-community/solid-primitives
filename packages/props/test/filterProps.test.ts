import { describe, test, expect } from "vitest";
import { createEffect, createRoot, createSignal, flush, merge } from "solid-js";
import { filterProps, createPropsPredicate, partitionProps } from "../src/index.js";

describe("filterProps", () => {
  test("filters props", () => {
    const props = { a: 1, b: 2, c: 3, d: 4 };
    const filtered = filterProps(props, key => key !== "b");
    expect(filtered).toEqual({ a: 1, c: 3, d: 4 });
    expect(Object.keys(filtered)).toEqual(["a", "c", "d"]);
  });

  test("predicate runs for every read", () => {
    const checked: string[] = [];
    const filtered: any = filterProps({ a: 1, b: 2, c: 3, d: 4 }, key => {
      checked.push(key);
      return true;
    });
    expect(checked.length).toEqual(0);
    filtered.a;
    expect(checked).toEqual(["a"]);
    checked.length = 0;

    filtered["not-existing"];
    expect(checked.length, "predicate is not run for non-existing keys").toEqual(0);
    checked.length = 0;

    filtered.b;
    filtered.a;
    filtered.a;
    expect(checked).toEqual(["b", "a", "a"]);
    checked.length = 0;

    Object.keys(filtered);
    expect(checked).toEqual(["a", "b", "c", "d"]);
  });

  test("supports dynamic props", () => {
    const [props, setProps] = createSignal<Record<string, number>>({ a: 1, b: 2, c: 3 });
    let captured: any;

    createRoot(dispose => {
      const proxy = merge(props);
      const filtered = filterProps(proxy, key => key !== "b" && key !== "d");
      createEffect(
        () => ({ ...filtered }),
        v => { captured = v; },
      );
      flush();
      expect(captured).toEqual({ a: 1, c: 3 });
    });

    setProps({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    flush();
    expect(captured).toEqual({ a: 1, c: 3, e: 5 });
  });
});

describe("filterProps + createPropsPredicate", () => {
  test("filters props", () =>
    createRoot(dispose => {
      const props = { a: 1, b: 2, c: 3, d: 4 };
      const filtered = filterProps(
        props,
        createPropsPredicate(props, key => key !== "b"),
      );
      expect(filtered).toEqual({ a: 1, c: 3, d: 4 });
      expect(Object.keys(filtered)).toEqual(["a", "c", "d"]);

      dispose();
    }));

  test("predicate is cached", () =>
    createRoot(dispose => {
      const props = { a: 1, b: 2, c: 3, d: 4 };
      const checked: string[] = [];
      const filtered: any = filterProps(
        props,
        createPropsPredicate(props, key => {
          checked.push(key);
          return true;
        }),
      );
      expect(checked.length).toBe(0);

      filtered.a;
      expect(checked).toEqual(["a"]);

      filtered.b;
      filtered.a;
      filtered.a;
      expect(checked).toEqual(["a", "b"]);

      Object.keys(filtered);
      expect(checked).toEqual(["a", "b", "c", "d"]);

      dispose();
    }));

  test("supports dynamic props", () => {
    const checked: string[] = [];
    const [props, setProps] = createSignal<Record<string, number>>({ a: 1, b: 2, c: 3 });
    let captured: any;

    createRoot(dispose => {
      const proxy = merge(props);
      const filtered = filterProps(
        proxy,
        createPropsPredicate(proxy, key => {
          checked.push(key);
          return key !== "b" && key !== "d";
        }),
      );
      createEffect(
        () => ({ ...filtered }),
        v => { captured = v; },
      );
      flush();
      expect(captured).toEqual({ a: 1, c: 3 });
      expect(checked).toEqual(["a", "b", "c"]);
      checked.length = 0;
    });

    setProps({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    flush();
    expect(captured).toEqual({ a: 1, c: 3, e: 5 });
    expect(checked).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("partitionProps", () => {
  test("splits props into matched and rest", () => {
    const props = { a: 1, b: 2, c: 3, d: 4 };
    const [matched, rest] = partitionProps(props, key => key === "a" || key === "c");

    expect(matched).toEqual({ a: 1, c: 3 });
    expect(rest).toEqual({ b: 2, d: 4 });
    expect(Object.keys(matched)).toEqual(["a", "c"]);
    expect(Object.keys(rest)).toEqual(["b", "d"]);
  });

  test("both views are lazy — predicate runs per read", () => {
    const checked: string[] = [];
    const props = { a: 1, b: 2, c: 3 };
    const [matched, rest] = partitionProps(props, key => {
      checked.push(key as string);
      return key !== "b";
    });

    expect(checked.length).toBe(0);

    matched.a;
    // predicate run once for matched.a
    expect(checked).toEqual(["a"]);

    rest.b;
    // predicate run once for rest.b (negated — "b" returns false, so rest includes it)
    expect(checked).toEqual(["a", "b"]);
  });

  test("both views update with dynamic props", () => {
    const [props, setProps] = createSignal<Record<string, number>>({ a: 1, b: 2, c: 3 });
    let capturedMatched: any;
    let capturedRest: any;

    createRoot(dispose => {
      const proxy = merge(props);
      const [matched, rest] = partitionProps(proxy, key => key !== "b");
      createEffect(
        () => [{ ...matched }, { ...rest }],
        ([m, r]) => { capturedMatched = m; capturedRest = r; },
      );
      flush();
      expect(capturedMatched).toEqual({ a: 1, c: 3 });
      expect(capturedRest).toEqual({ b: 2 });
    });

    setProps({ a: 10, b: 20, c: 30, d: 40 });
    flush();
    expect(capturedMatched).toEqual({ a: 10, c: 30, d: 40 });
    expect(capturedRest).toEqual({ b: 20 });
  });

  test("works with createPropsPredicate to share cache across both views", () =>
    createRoot(dispose => {
      const props = { a: 1, b: 2, c: 3, d: 4 };
      const checked: string[] = [];
      const pred = createPropsPredicate(props, key => {
        checked.push(key as string);
        return key !== "b";
      });
      const [matched, rest] = partitionProps(props, pred);

      matched.a;
      matched.a; // cache hit — predicate should not run again
      rest.b;
      rest.b;   // cache hit

      expect(checked).toEqual(["a", "b"]);

      dispose();
    }));
});
