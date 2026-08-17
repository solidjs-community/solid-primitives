import { describe, test, expect } from "vitest";
import { ascending, descending, by, combine, reverse } from "../src/index.ts";

describe("ascending", () => {
  test("orders numbers/strings naturally", () => {
    expect([3, 1, 2].sort(ascending)).toEqual([1, 2, 3]);
    expect(["b", "a", "c"].sort(ascending)).toEqual(["a", "b", "c"]);
  });

  test("undefined and null always sort to the end", () => {
    // `undefined` is moved to the very end by the JS engine itself, unconditionally, before our
    // comparator ever runs — `null` is a normal value as far as the engine is concerned, so it's
    // ordered by our comparator (which also treats it as "missing", placing it after every real
    // value) and lands just before the unconditionally-appended `undefined`.
    expect([2, undefined, 1, null, 3].sort(ascending)).toEqual([1, 2, 3, null, undefined]);
  });

  test("NaN sorts to the end, like undefined", () => {
    expect([2, NaN, 1].sort(ascending)).toEqual([1, 2, NaN]);
  });
});

describe("descending", () => {
  test("reverses comparable order", () => {
    expect([1, 3, 2].sort(descending)).toEqual([3, 2, 1]);
  });

  test("still sorts undefined/NaN to the end", () => {
    // Same caveat as above: `undefined` is moved to the end by the engine, unconditionally;
    // `NaN` is a normal number to the engine, so our comparator places it last among the
    // comparator-ordered values, just before `undefined`.
    expect([2, undefined, 1, NaN, 3].sort(descending)).toEqual([3, 2, 1, NaN, undefined]);
  });
});

describe("by", () => {
  test("orders by a derived key, ascending by default", () => {
    const items = [{ price: 3 }, { price: 1 }, { price: 2 }];
    expect(items.sort(by(item => item.price)).map(i => i.price)).toEqual([1, 2, 3]);
  });

  test("accepts a custom comparator for the derived key", () => {
    const items = [{ price: 1 }, { price: 3 }, { price: 2 }];
    expect(items.sort(by(item => item.price, descending)).map(i => i.price)).toEqual([3, 2, 1]);
  });
});

describe("combine", () => {
  test("breaks ties with later comparators", () => {
    const items = [
      { category: "b", price: 2 },
      { category: "a", price: 3 },
      { category: "a", price: 1 },
    ];
    const sorted = items.sort(
      combine(
        by((i: (typeof items)[number]) => i.category),
        by((i: (typeof items)[number]) => i.price),
      ),
    );
    expect(sorted).toEqual([
      { category: "a", price: 1 },
      { category: "a", price: 3 },
      { category: "b", price: 2 },
    ]);
  });
});

describe("reverse", () => {
  test("flips any comparator", () => {
    expect([1, 3, 2].sort(reverse(ascending))).toEqual([3, 2, 1]);
    expect([1, 3, 2].sort(reverse(descending))).toEqual([1, 2, 3]);
  });
});
