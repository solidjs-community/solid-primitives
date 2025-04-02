import { createComputed, createEffect, createRoot } from "solid-js";
import { expect, describe, it, test, vi } from "vitest";
import { ReactiveMap, ReactiveWeakMap } from "../src/index.js";

describe("ReactiveMap", () => {
  it("behaves like a Map", () => {
    const obj1 = {};
    const obj2 = {};

    const map = new ReactiveMap<any, any>([
      [obj1, 123],
      [1, "foo"],
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
        [3, {}],
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
        [3, obj4],
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

  test("spread values is reactive", () => {
    const map = new ReactiveMap([
      [1, "a"],
      [1, "b"],
      [2, "c"],
      [3, "d"],
    ]);

    const captured: any[] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => captured.push([...map.values()]));
      return dispose;
    });

    expect(captured, "1").toHaveLength(1);
    expect(captured[0], "1").toEqual(["b", "c", "d"]);

    map.set(4, "e");
    expect(captured, "2").toHaveLength(2);
    expect(captured[1], "2").toEqual(["b", "c", "d", "e"]);

    map.set(4, "e");
    expect(captured, "3").toHaveLength(2);

    map.delete(4);
    expect(captured, "4").toHaveLength(3);
    expect(captured[2], "4").toEqual(["b", "c", "d"]);

    map.delete(2);
    expect(captured, "5").toHaveLength(4);
    expect(captured[3], "5").toEqual(["b", "d"]);

    map.delete(2);
    expect(captured, "6").toHaveLength(4);

    map.set(2, "a");
    expect(captured, "7").toHaveLength(5);
    expect(captured[4], "7").toEqual(["b", "d", "a"]);

    map.set(2, "b");
    expect(captured, "8").toHaveLength(6);
    expect(captured[5], "8").toEqual(["b", "d", "b"]);

    map.clear();
    expect(captured, "9").toHaveLength(7);
    expect(captured[6], "9").toEqual([]);

    dispose();
  });

  test(".size is reactive", () => {
    createRoot(dispose => {
      const map = new ReactiveMap([
        [1, {}],
        [1, {}],
        [2, {}],
        [3, {}],
      ]);

      const captured: any[] = [];
      createComputed(() => {
        captured.push(map.size);
      });
      expect(captured, "1").toHaveLength(1);
      expect(captured[0], "1").toEqual(3);

      map.set(4, {});
      expect(captured, "2").toHaveLength(2);
      expect(captured[1], "2").toEqual(4);

      map.delete(4);
      expect(captured, "3").toHaveLength(3);
      expect(captured[2], "3").toEqual(3);

      map.delete(2);
      expect(captured, "4").toHaveLength(4);
      expect(captured[3], "4").toEqual(2);

      map.delete(2);
      expect(captured, "5").toHaveLength(4);

      map.set(2, {});
      expect(captured, "6").toHaveLength(5);
      expect(captured[4], "6").toEqual(3);

      map.set(2, {});
      expect(captured, "7").toHaveLength(5);

      map.clear();
      expect(captured, "8").toHaveLength(6);
      expect(captured[5], "8").toEqual(0);

      dispose();
    });
  });

  test(".keys() is reactive", () => {
    const map = new ReactiveMap([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    const captured: unknown[][] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        const run: unknown[] = [];
        for (const key of map.keys()) {
          run.push(key);
        }
        captured.push(run);
      });
      return dispose;
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([1, 2, 3]);

    map.set(1, "e");
    expect(captured, "value change").toHaveLength(1);

    map.set(4, "f");
    expect(captured, "new key added").toHaveLength(2);

    map.delete(1);
    expect(captured, "seen key change").toHaveLength(3);
    expect(captured[2]).toEqual([2, 3, 4]);

    dispose();
  });

  test(".values() is reactive", () => {
    const map = new ReactiveMap([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    const captured: unknown[][] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        const run: unknown[] = [];
        for (const v of map.values()) {
          run.push(v);
        }
        captured.push(run);
      });
      return dispose;
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual(["a", "b", "c"]);

    map.set(1, "e");
    expect(captured, "value change").toHaveLength(2);
    expect(captured[1]).toEqual(["e", "b", "c"]);

    map.set(4, "f");
    expect(captured, "new key added").toHaveLength(3);
    expect(captured[2]).toEqual(["e", "b", "c", "f"]);

    map.delete(4);
    expect(captured, "key removed").toHaveLength(4);
    expect(captured[3]).toEqual(["e", "b", "c"]);

    dispose();
  });

  test(".entries() is reactive", () => {
    const map = new ReactiveMap([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    const captured: unknown[][] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        const run: unknown[] = [];
        for (const e of map.entries()) {
          run.push(e);
        }
        captured.push(run);
      });
      return dispose;
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    map.set(1, "e");
    expect(captured, "value change").toHaveLength(2);
    expect(captured[1]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
    ]);

    map.set(4, "f");
    expect(captured, "new key added").toHaveLength(3);
    expect(captured[2]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
      [4, "f"],
    ]);

    map.delete(4);
    expect(captured, "key removed").toHaveLength(4);
    expect(captured[3]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
    ]);

    dispose();
  });

  test(".forEach() is reactive", () => {
    const map = new ReactiveMap([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    const captured: unknown[][] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        const run: unknown[] = [];
        map.forEach((v, k) => {
          run.push([k, v]);
        });
        captured.push(run);
      });
      return dispose;
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    map.set(1, "e");
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
    ]);

    map.delete(3);
    expect(captured).toHaveLength(3);
    expect(captured[2]).toEqual([
      [1, "e"],
      [2, "b"],
    ]);

    dispose();
  });
  test(".clear() notifies only listeners of existing members", () =>
    createRoot(dispose => {
      const map = new ReactiveMap([
        [1, "a"],
        [2, "b"],
        [3, "c"],
      ]);

      const existingKey = vi.fn();
      createComputed(() => existingKey(map.has(2)));

      const existingValue = vi.fn();
      createComputed(() => existingValue(map.get(2)));

      const nonexistingKey = vi.fn();
      createComputed(() => nonexistingKey(map.has(4)));

      const nonexistingValue = vi.fn();
      createComputed(() => nonexistingValue(map.get(4)));

      expect(existingKey).toHaveBeenNthCalledWith(1, true);
      expect(existingValue).toHaveBeenNthCalledWith(1, "b");

      expect(nonexistingKey).toHaveBeenNthCalledWith(1, false);
      expect(nonexistingValue).toHaveBeenNthCalledWith(1, undefined);

      map.clear();

      expect(existingKey).toHaveBeenCalledTimes(2);
      expect(existingKey).toHaveBeenNthCalledWith(2, false);

      expect(existingValue).toHaveBeenCalledTimes(2);
      expect(existingValue).toHaveBeenNthCalledWith(2, undefined);

      expect(nonexistingKey).toHaveBeenCalledTimes(1);
      expect(nonexistingValue).toHaveBeenCalledTimes(1);

      dispose();
    }));
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
        [obj2, 123],
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
