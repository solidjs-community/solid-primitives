import { expect, describe, it } from "vitest";
import { ReactiveMap, ReactiveWeakMap } from "../src";

describe("ReactiveMap", () => {
  it("behaves like a Map", () => {
    const obj1 = {};
    const obj2 = {};

    const map = new ReactiveMap<any, any>([
      [obj1, 123],
      [1, "foo"]
    ]);

    expect(map.has(obj1)).toBe(true);
    expect(map.has(1)).toBe(true);
    expect(map.has(2)).toBe(false);

    expect(map.get(obj1)).toBe(123);
    expect(map.get(1)).toBe("foo");

    map.set(obj2, "bar");
    expect(map.get(obj2)).toBe("bar");
    map.set(obj1, "change");
    expect(map.get(obj1)).toBe("change");

    expect(map.delete(obj2)).toBe(true);
    expect(map.has(obj2)).toBe(false);

    expect(map.size).toBe(2);
    map.clear();
    expect(map.size).toBe(0);

    expect(map).instanceOf(Map);
    expect(map).instanceOf(ReactiveMap);
  });
});

describe("ReactiveWeakMap", () => {
  it("behaves like a Map", () => {
    const obj1 = {};
    const obj2 = {};

    const map = new ReactiveWeakMap<object, any>([[obj1, 123]]);

    expect(map.has(obj1)).toBe(true);
    expect(map.has(obj2)).toBe(false);

    expect(map.get(obj1)).toBe(123);

    map.set(obj2, "bar");
    expect(map.get(obj2)).toBe("bar");
    map.set(obj1, "change");
    expect(map.get(obj1)).toBe("change");

    expect(map.delete(obj2)).toBe(true);
    expect(map.has(obj2)).toBe(false);

    expect(map).instanceOf(WeakMap);
    expect(map).instanceOf(ReactiveWeakMap);
  });
});
