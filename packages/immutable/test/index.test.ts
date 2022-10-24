import { describe, expect, test } from "vitest";
import {
  update,
  concat,
  split,
  get,
  sortBy,
  merge,
  removeItems,
  filterInstance,
  filterOutInstance
} from "../src";

const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

describe("update", () => {
  test("update()", () => {
    const original = {
      a: 123,
      b: { inner: { c: "yo", d: [0, 1, 2], test: "test" } },
      arr: [1, 2, 3]
    };
    const originalClone = cloneDeep(original);

    let captirePrev: any;
    const x = update(original, "a", prev => {
      captirePrev = prev;
      return "69";
    });
    expect(x.a).toBe("69");
    expect(captirePrev).toBe(123);

    const y = update(original, "b", "inner", "69");
    expect(y.b.inner).toBe("69");

    const z = update(original, "b", "inner", "c", { aha: 123 });
    expect(z.b.inner.c.aha).toBe(123);
    expect(z.b.inner.d).toEqual([0, 1, 2]);

    const a = update(original, "arr", 0, "yoo");
    expect(a.arr).toEqual(["yoo", 2, 3]);

    const theSame = update(original, "b", "inner", "c", "yo");
    expect(theSame, "no changes makes no changes").toEqual(originalClone);

    const fnUpdate = update(original, "b", "inner", "d", list => [...list, 3]);
    expect(fnUpdate.b.inner.d).toEqual([0, 1, 2, 3]);
    expect(original.b.inner.d).toEqual([0, 1, 2]);

    expect(original).toEqual(originalClone);
  });
});

describe("concat", () => {
  test("concat()", () => {
    const originalArgs = [1, 2, ["a", "b"], "c", [3, [4, 5]]];
    const copiedArgs = cloneDeep(originalArgs);

    const a = concat(...originalArgs);
    expect(a).toEqual([1, 2, "a", "b", "c", 3, [4, 5]]);
    expect(originalArgs).toEqual(copiedArgs);
  });
});

describe("split", () => {
  test("split()", () => {
    const original = { a: 123, b: "foo", c: { inner: 1 }, d: [1, 2, 3] };
    const originalCopy = cloneDeep(original);

    const [a, b] = split(original, "a", "c");
    expect(a).toEqual({ a: 123, c: { inner: 1 } });
    expect(b).toEqual({ b: "foo", d: [1, 2, 3] });

    const [c, d, e] = split(original, ["a"], ["c", "b"]);
    expect(c).toEqual({ a: 123 });
    expect(d).toEqual({ b: "foo", c: { inner: 1 } });
    expect(e).toEqual({ d: [1, 2, 3] });

    expect(original).toEqual(originalCopy);
  });
});

describe("get", () => {
  test("get()", () => {
    const original = {
      a: 123,
      b: "foo",
      c: { inner: { x: "baz" } },
      d: [1, 2, ["bar"]] as [number, number, string[]]
    };
    const originalCopy = cloneDeep(original);

    expect(get(original, "a")).toBe(123);
    expect(get(original, "c", "inner", "x")).toBe("baz");
    expect(get(original, "d", 2, 0)).toBe("bar");
    expect(original).toEqual(originalCopy);
  });
});

describe("sortBy", () => {
  test("sortBy()", () => {
    const source = [
      { x: "b", y: 4 },
      { x: "a", y: 2 },
      { x: "b", y: 3 },
      { x: "a", y: 1 }
    ];

    expect(sortBy(source, ({ x }) => x)).toEqual([
      { x: "a", y: 2 },
      { x: "a", y: 1 },
      { x: "b", y: 4 },
      { x: "b", y: 3 }
    ]);

    expect(sortBy(source, ["x", "y"])).toEqual([
      { x: "a", y: 1 },
      { x: "a", y: 2 },
      { x: "b", y: 3 },
      { x: "b", y: 4 }
    ]);

    expect(sortBy(source, ({ y }) => y / 10)).toEqual([
      { x: "a", y: 1 },
      { x: "a", y: 2 },
      { x: "b", y: 3 },
      { x: "b", y: 4 }
    ]);
  });
});

describe("merge", () => {
  test("merges", () => {
    const a = { foo: "bar", arr: [1, 2, 3] };
    const a_copy = cloneDeep(a);
    const b = { foo: "baz", arr: [1, 2, 3], inner: { z: 123 } };
    const b_copy = cloneDeep(b);
    const c = { arr: [1, 2, 3, 4], inner: { z: 321 } };
    const c_copy = cloneDeep(c);
    const x = merge(a, b, c);
    expect(a_copy).toEqual(a);
    expect(b_copy).toEqual(b);
    expect(c_copy).toEqual(c);
    expect(x).toEqual({ foo: "baz", arr: [1, 2, 3, 4], inner: { z: 321 } });
  });
});

describe("removeItems", () => {
  test("removeItems", () => {
    const res = removeItems([1, 2, 3, 4, 5, 6, 7, 8, 9], 2, 6, 7, 11);
    expect(res).toEqual([1, 3, 4, 5, 8, 9]);
  });
});

describe("filterInstance()", () => {
  test("*", () => {
    const num = 12345;
    const string = "hello";
    const el = document.createElement("div");
    const svg = document.createElement("svg");
    const list = [num, string, el, svg, string, null, undefined, NaN];
    const copy = [num, string, el, svg, string, null, undefined, NaN];

    const a = filterInstance(list, Element, Number);
    expect(a).toEqual([num, el, svg]);
    const b = filterOutInstance(list, Element, Number);
    expect(b).toEqual([string, string]);
    expect(list, "nonmutable").toEqual(copy);
  });
});
