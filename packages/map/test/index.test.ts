import { createEffect, createRoot, flush } from "solid-js";
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
      createEffect(
        () => map.has(2),
        v => {
          captured.push(v);
        },
      );
      flush();
      expect(captured, "1").toEqual([true]);

      map.set(4, {});
      flush();
      expect(captured, "2").toEqual([true]);

      map.delete(4);
      flush();
      expect(captured, "3").toEqual([true]);

      map.delete(2);
      flush();
      expect(captured, "4").toEqual([true, false]);

      map.set(2, {});
      flush();
      expect(captured, "5").toEqual([true, false, true]);

      map.clear();
      flush();
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
      createEffect(
        () => map.get(2),
        value => {
          fn(value);
        },
      );
      flush();
      expect(fn).toHaveBeenLastCalledWith({});

      map.set(4, {});
      flush();
      expect(fn).toBeCalledTimes(1);

      map.delete(4);
      flush();
      expect(fn).toBeCalledTimes(1);

      map.delete(2);
      flush();
      expect(fn).toHaveBeenLastCalledWith(undefined);

      map.set(2, obj4);
      flush();
      expect(fn).toHaveBeenLastCalledWith(obj4);

      map.set(2, obj4);
      flush();
      expect(fn).toBeCalledTimes(3);

      map.clear();
      flush();
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
      createEffect(
        () => [...map.values()],
        values => {
          captured.push(values);
        },
      );
      return dispose;
    });
    flush();

    expect(captured, "1").toHaveLength(1);
    expect(captured[0], "1").toEqual(["b", "c", "d"]);

    map.set(4, "e");
    flush();
    expect(captured, "2").toHaveLength(2);
    expect(captured[1], "2").toEqual(["b", "c", "d", "e"]);

    map.set(4, "e");
    flush();
    expect(captured, "3").toHaveLength(2);

    map.delete(4);
    flush();
    expect(captured, "4").toHaveLength(3);
    expect(captured[2], "4").toEqual(["b", "c", "d"]);

    map.delete(2);
    flush();
    expect(captured, "5").toHaveLength(4);
    expect(captured[3], "5").toEqual(["b", "d"]);

    map.delete(2);
    flush();
    expect(captured, "6").toHaveLength(4);

    map.set(2, "a");
    flush();
    expect(captured, "7").toHaveLength(5);
    expect(captured[4], "7").toEqual(["b", "d", "a"]);

    map.set(2, "b");
    flush();
    expect(captured, "8").toHaveLength(6);
    expect(captured[5], "8").toEqual(["b", "d", "b"]);

    map.clear();
    flush();
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
      createEffect(
        () => map.size,
        size => {
          captured.push(size);
        },
      );
      flush();
      expect(captured, "1").toHaveLength(1);
      expect(captured[0], "1").toEqual(3);

      map.set(4, {});
      flush();
      expect(captured, "2").toHaveLength(2);
      expect(captured[1], "2").toEqual(4);

      map.delete(4);
      flush();
      expect(captured, "3").toHaveLength(3);
      expect(captured[2], "3").toEqual(3);

      map.delete(2);
      flush();
      expect(captured, "4").toHaveLength(4);
      expect(captured[3], "4").toEqual(2);

      map.delete(2);
      flush();
      expect(captured, "5").toHaveLength(4);

      map.set(2, {});
      flush();
      expect(captured, "6").toHaveLength(5);
      expect(captured[4], "6").toEqual(3);

      map.set(2, {});
      flush();
      expect(captured, "7").toHaveLength(5);

      map.clear();
      flush();
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
      createEffect(
        () => [...map.keys()],
        keys => {
          captured.push(keys);
        },
      );
      return dispose;
    });
    flush();

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([1, 2, 3]);

    map.set(1, "e");
    flush();
    expect(captured, "value change").toHaveLength(1);

    map.set(4, "f");
    flush();
    expect(captured, "new key added").toHaveLength(2);

    map.delete(1);
    flush();
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
      createEffect(
        () => [...map.values()],
        values => {
          captured.push(values);
        },
      );
      return dispose;
    });
    flush();

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual(["a", "b", "c"]);

    map.set(1, "e");
    flush();
    expect(captured, "value change").toHaveLength(2);
    expect(captured[1]).toEqual(["e", "b", "c"]);

    map.set(4, "f");
    flush();
    expect(captured, "new key added").toHaveLength(3);
    expect(captured[2]).toEqual(["e", "b", "c", "f"]);

    map.delete(4);
    flush();
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
      createEffect(
        () => [...map.entries()],
        entries => {
          captured.push(entries);
        },
      );
      return dispose;
    });
    flush();

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    map.set(1, "e");
    flush();
    expect(captured, "value change").toHaveLength(2);
    expect(captured[1]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
    ]);

    map.set(4, "f");
    flush();
    expect(captured, "new key added").toHaveLength(3);
    expect(captured[2]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
      [4, "f"],
    ]);

    map.delete(4);
    flush();
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
      createEffect(
        () => {
          const run: unknown[] = [];
          map.forEach((v, k) => {
            run.push([k, v]);
          });
          return run;
        },
        run => {
          captured.push(run);
        },
      );
      return dispose;
    });
    flush();

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);

    map.set(1, "e");
    flush();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      [1, "e"],
      [2, "b"],
      [3, "c"],
    ]);

    map.delete(3);
    flush();
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
      createEffect(
        () => map.has(2),
        v => existingKey(v),
      );

      const existingValue = vi.fn();
      createEffect(
        () => map.get(2),
        v => existingValue(v),
      );

      const nonexistingKey = vi.fn();
      createEffect(
        () => map.has(4),
        v => nonexistingKey(v),
      );

      const nonexistingValue = vi.fn();
      createEffect(
        () => map.get(4),
        v => nonexistingValue(v),
      );

      flush();

      expect(existingKey).toHaveBeenNthCalledWith(1, true);
      expect(existingValue).toHaveBeenNthCalledWith(1, "b");

      expect(nonexistingKey).toHaveBeenNthCalledWith(1, false);
      expect(nonexistingValue).toHaveBeenNthCalledWith(1, undefined);

      map.clear();
      flush();

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
      createEffect(
        () => map.has(obj1),
        v => {
          captured.push(v);
        },
      );
      flush();
      expect(captured, "1").toEqual([true]);

      map.set(obj3, {});
      flush();
      expect(captured, "2").toEqual([true]);

      map.delete(obj3);
      flush();
      expect(captured, "3").toEqual([true]);

      map.delete(obj1);
      flush();
      expect(captured, "4").toEqual([true, false]);

      map.set(obj1, {});
      flush();
      expect(captured, "5").toEqual([true, false, true]);

      map.set(obj4, {});
      flush();
      expect(captured, "7").toEqual([true, false, true]);

      map.set(obj1, {});
      flush();
      expect(captured, "8").toEqual([true, false, true]);

      dispose();
    });
  });
});

describe("ReactiveMap iterators track eagerly (#830)", () => {
  const methods: Record<
    string,
    { create: (map: ReactiveMap<number, string>) => Iterator<unknown>; onValueChange: boolean }
  > = {
    keys: { create: map => map.keys(), onValueChange: false },
    values: { create: map => map.values(), onValueChange: true },
    entries: { create: map => map.entries(), onValueChange: true },
    "[Symbol.iterator]": { create: map => map[Symbol.iterator](), onValueChange: true },
  };

  for (const [name, { create, onValueChange }] of Object.entries(methods)) {
    test(`${name}() tracks when created, even if consumed later`, () => {
      const map = new ReactiveMap([
        [1, "a"],
        [2, "b"],
      ]);
      const iterators: Iterator<unknown>[] = [];

      const dispose = createRoot(dispose => {
        createEffect(
          () => {
            // create the iterator but do not consume it inside the tracking scope
            iterators.push(create(map));
          },
          () => {},
        );
        return dispose;
      });
      flush();
      expect(iterators).toHaveLength(1);

      map.set(3, "c");
      flush();
      expect(iterators, "re-ran after new key").toHaveLength(2);

      // consuming the iterator later still yields the live contents
      const consumed = [...{ [Symbol.iterator]: () => iterators[1]! }];
      expect(consumed).toHaveLength(3);

      map.set(1, "z");
      flush();
      expect(iterators, "value change").toHaveLength(onValueChange ? 3 : 2);

      dispose();
    });
  }
});

describe("ReactiveMap iterator consumed in effect apply phase (#830)", () => {
  test("compute returns entries() iterator, apply consumes it, re-runs on change", () => {
    const map = new ReactiveMap<string, number>([["a", 1]]);
    const seen: [string, number][][] = [];

    const dispose = createRoot(dispose => {
      createEffect(
        () => map.entries(),
        it => {
          seen.push([...{ [Symbol.iterator]: () => it }]);
        },
      );
      return dispose;
    });
    flush();
    expect(seen).toEqual([[["a", 1]]]);

    map.set("a", 2);
    flush();
    map.set("b", 3);
    flush();
    map.delete("a");
    flush();
    expect(seen).toEqual([
      [["a", 1]],
      [["a", 2]],
      [
        ["a", 2],
        ["b", 3],
      ],
      [["b", 3]],
    ]);

    dispose();
  });

  test("keys() created in compute does not re-run on value-only change", () => {
    const map = new ReactiveMap<string, number>([["a", 1]]);
    let runs = 0;
    const dispose = createRoot(dispose => {
      createEffect(
        () => map.keys(),
        () => {
          runs++;
        },
      );
      return dispose;
    });
    flush();
    map.set("a", 2);
    flush();
    expect(runs).toBe(1);
    map.set("b", 1);
    flush();
    expect(runs).toBe(2);
    dispose();
  });
});
