import { createComputed, createRoot } from "solid-js";
import { expect, describe, it, test, vi } from "vitest";
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

  test("has() is reactive", () =>
    createRoot(dispose => {
      const map = new ReactiveMap([
        [1, {}],
        [1, {}],
        [2, {}],
        [3, {}]
      ]);

      const captured: any[] = [];
      createComputed(() => {
        captured.push(map.has(2));
      });
      expect(captured, "1").toEqual([true]);

      map.set(4, {});
      expect(captured, "2").toEqual([true]);

      map.delete(4);
      expect(captured, "3").toEqual([true]);

      map.delete(2);
      expect(captured, "4").toEqual([true, false]);

      map.set(2, {});
      expect(captured, "5").toEqual([true, false, true]);

      map.clear();
      expect(captured, "6").toEqual([true, false, true, false]);

      dispose();
    }));

  test("spread is reactive", () =>
    createRoot(dispose => {
      const map = new ReactiveMap([
        [1, {}],
        [1, {}],
        [2, {}],
        [3, {}]
      ]);

      const fn = vi.fn();
      createComputed(() => fn([...map.keys()]));
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3]);

      map.set(4, {});
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3, 4]);

      map.set(4, {});
      expect(fn, "updating value shouldn't trigger keys").toBeCalledTimes(2);

      map.delete(4);
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3]);

      map.delete(2);
      expect(fn).toHaveBeenLastCalledWith([1, 3]);

      map.delete(2);
      expect(fn).toBeCalledTimes(4);

      map.set(2, {});
      expect(fn).toHaveBeenLastCalledWith([1, 3, 2]);

      map.clear();
      expect(fn).toHaveBeenLastCalledWith([]);

      dispose();
    }));

  test("get() is reactive", () => {
    createRoot(dispose => {
      const obj1 = {};
      const obj2 = {};
      const obj3 = {};
      const obj4 = {};

      const map = new ReactiveMap([
        [1, obj1],
        [1, obj2],
        [2, obj3],
        [3, obj4]
      ]);

      const fn = vi.fn();
      createComputed(() => fn(map.get(2)));
      expect(fn).toHaveBeenLastCalledWith({});

      map.set(4, {});
      expect(fn).toBeCalledTimes(1);

      map.delete(4);
      expect(fn).toBeCalledTimes(1);

      map.delete(2);
      expect(fn).toHaveBeenLastCalledWith(undefined);

      map.set(2, obj4);
      expect(fn).toHaveBeenLastCalledWith(obj4);

      map.set(2, obj4);
      expect(fn).toBeCalledTimes(3);

      map.clear();
      expect(fn).toHaveBeenLastCalledWith(undefined);

      dispose();
    });
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

  it("is reactive", () => {
    createRoot(dispose => {
      const obj1 = {};
      const obj2 = {};
      const obj3 = {};
      const obj4 = {};

      const map = new ReactiveWeakMap<object, any>([
        [obj1, 123],
        [obj2, 123]
      ]);

      const captured: any[] = [];
      createComputed(() => {
        captured.push(map.has(obj1));
      });
      expect(captured, "1").toEqual([true]);

      map.set(obj3, {});
      expect(captured, "2").toEqual([true]);

      map.delete(obj3);
      expect(captured, "3").toEqual([true]);

      map.delete(obj1);
      expect(captured, "4").toEqual([true, false]);

      map.set(obj1, {});
      expect(captured, "5").toEqual([true, false, true]);

      map.set(obj4, {});
      expect(captured, "7").toEqual([true, false, true]);

      map.set(obj1, {});
      expect(captured, "8").toEqual([true, false, true]);

      dispose();
    });
  });
});
