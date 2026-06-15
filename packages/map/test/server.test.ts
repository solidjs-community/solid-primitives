import { describe, it, expect } from "vitest";
import { ReactiveMap, ReactiveWeakMap } from "../src/index.js";

describe("ReactiveMap - SSR", () => {
  it("works without throwing on the server", () => {
    const map = new ReactiveMap<number, string>([
      [1, "a"],
      [2, "b"],
    ]);

    expect(map.has(1)).toBe(true);
    expect(map.has(3)).toBe(false);
    expect(map.get(1)).toBe("a");
    expect(map.size).toBe(2);
    expect([...map.keys()]).toEqual([1, 2]);
    expect([...map.values()]).toEqual(["a", "b"]);
    expect([...map.entries()]).toEqual([
      [1, "a"],
      [2, "b"],
    ]);

    map.set(3, "c");
    expect(map.has(3)).toBe(true);

    map.delete(1);
    expect(map.has(1)).toBe(false);

    map.clear();
    expect(map.size).toBe(0);
  });
});

describe("ReactiveWeakMap - SSR", () => {
  it("works without throwing on the server", () => {
    const obj1 = {};
    const obj2 = {};
    const map = new ReactiveWeakMap<object, number>([[obj1, 1]]);

    expect(map.has(obj1)).toBe(true);
    expect(map.has(obj2)).toBe(false);
    expect(map.get(obj1)).toBe(1);

    map.set(obj1, 2);
    expect(map.get(obj1)).toBe(2);

    map.delete(obj1);
    expect(map.has(obj1)).toBe(false);
  });
});
