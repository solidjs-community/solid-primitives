import { describe, test, it, expect, vi } from "vitest";
import { ReactiveSet, ReactiveWeakSet } from "../src/index.js";
import { createComputed, createEffect, createRoot } from "solid-js";

describe("ReactiveSet", () => {
  it("behaves like Set", () => {
    const set = new ReactiveSet([1, 1, 2, 3]);
    expect([...set]).toEqual([1, 2, 3]);

    set.add(4);
    expect([...set]).toEqual([1, 2, 3, 4]);

    set.add(4);
    expect([...set]).toEqual([1, 2, 3, 4]);

    expect(set.has(2)).toBeTruthy();
    expect(set.delete(2)).toBeTruthy();
    expect(set.has(2)).toBeFalsy();

    set.clear();
    expect(set.size).toBe(0);

    expect(set).instanceOf(Set);
    expect(set).instanceOf(ReactiveSet);
  });

  test("has() is reactive", () =>
    createRoot(dispose => {
      const set = new ReactiveSet([1, 1, 2, 3]);

      const captured: any[] = [];
      createComputed(() => {
        captured.push(set.has(2));
      });
      expect(captured, "1").toEqual([true]);

      set.add(4);
      expect(captured, "2").toEqual([true]);

      set.delete(4);
      expect(captured, "3").toEqual([true]);

      set.delete(2);
      expect(captured, "4").toEqual([true, false]);

      set.add(2);
      expect(captured, "5").toEqual([true, false, true]);

      set.clear();
      expect(captured, "6").toEqual([true, false, true, false]);

      dispose();
    }));

  test("spread is reactive", () =>
    createRoot(dispose => {
      const set = new ReactiveSet([1, 1, 2, 3]);

      const fn = vi.fn();
      createComputed(() => fn([...set]));
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3]);

      set.add(4);
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3, 4]);

      set.delete(4);
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3]);

      set.delete(2);
      expect(fn).toHaveBeenLastCalledWith([1, 3]);

      set.delete(2);
      expect(fn).toBeCalledTimes(4);

      set.add(2);
      expect(fn).toHaveBeenLastCalledWith([1, 3, 2]);

      set.clear();
      expect(fn).toHaveBeenLastCalledWith([]);

      dispose();
    }));

  const iterators: Record<string, (set: ReactiveSet<number>) => IterableIterator<number>> = {
    keys: set => set.keys(),
    values: set => set.values(),
    *entries(set) {
      for (const [key] of set.entries()) {
        yield key;
      }
    },
  };

  for (const [name, fn] of Object.entries(iterators)) {
    test(name + " is reactive", () => {
      const set = new ReactiveSet([1, 2, 3, 4]);

      const captured: number[][] = [];

      const dispose = createRoot(dispose => {
        createEffect(() => {
          const run: number[] = [];
          for (const key of fn(set)) {
            run.push(key);
          }
          captured.push(run);
        });
        return dispose;
      });

      expect(captured).toHaveLength(1);
      expect(captured[0]).toEqual([1, 2, 3, 4]);

      set.delete(4);
      expect(captured).toHaveLength(2);
      expect(captured[1]).toEqual([1, 2, 3]);

      set.delete(1);
      expect(captured).toHaveLength(3);
      expect(captured[2]).toEqual([2, 3]);

      set.add(4);
      expect(captured).toHaveLength(4);
      expect(captured[3]).toEqual([2, 3, 4]);

      set.add(5);
      expect(captured).toHaveLength(5);
      expect(captured[4]).toEqual([2, 3, 4, 5]);

      set.add(5);
      expect(captured).toHaveLength(5);

      set.clear();
      expect(captured).toHaveLength(6);
      expect(captured[5]).toEqual([]);

      dispose();
    });
  }

  test("forEach is reactive", () => {
    const set = new ReactiveSet([1, 2, 3, 4]);

    const captured: number[][] = [];

    const dispose = createRoot(dispose => {
      createEffect(() => {
        const run: number[] = [];
        set.forEach(key => {
          run.push(key);
        });
        captured.push(run);
      });
      return dispose;
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([1, 2, 3, 4]);

    set.delete(4);
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([1, 2, 3]);

    set.delete(1);
    expect(captured).toHaveLength(3);
    expect(captured[2]).toEqual([2, 3]);

    set.add(4);
    expect(captured).toHaveLength(4);
    expect(captured[3]).toEqual([2, 3, 4]);

    set.add(5);
    expect(captured).toHaveLength(5);
    expect(captured[4]).toEqual([2, 3, 4, 5]);

    set.add(5);
    expect(captured).toHaveLength(5);

    set.clear();
    expect(captured).toHaveLength(6);
    expect(captured[5]).toEqual([]);

    dispose();
  });

  test("clear notifies only listeners of existing members", () =>
    createRoot(dispose => {
      const set = new ReactiveSet([1, 2, 3, 4]);

      const existing = vi.fn();
      createComputed(() => existing(set.has(2)));

      const nonexisting = vi.fn();
      createComputed(() => nonexisting(set.has(5)));

      expect(existing).toHaveBeenNthCalledWith(1, true);
      expect(nonexisting).toHaveBeenNthCalledWith(1, false);

      set.clear();

      expect(existing).toHaveBeenCalledTimes(2);
      expect(existing).toHaveBeenNthCalledWith(2, false);

      expect(nonexisting).toHaveBeenCalledTimes(1);

      dispose();
    }));
});

describe("ReactiveWeakSet", () => {
  it("behaves like a WeakSet", () => {
    const a = {};
    const b = {};
    const c = {};
    const d = {};
    const e = {};

    const set = new ReactiveWeakSet([a, a, b, c, d]);
    expect(set.has(a)).toBeTruthy();
    expect(set.has(b)).toBeTruthy();
    expect(set.has(c)).toBeTruthy();
    expect(set.has(d)).toBeTruthy();
    expect(set.has(e)).toBeFalsy();

    set.add(e);
    expect(set.has(e)).toBeTruthy();
    set.add(e);

    expect(set.delete(a)).toBeTruthy();
    expect(set.has(a)).toBeFalsy();

    expect(set).instanceOf(WeakSet);
    expect(set).instanceOf(ReactiveWeakSet);
  });

  it("is reactive", () => {
    createRoot(dispose => {
      const a = {};
      const b = {};
      const c = {};
      const d = {};
      const e = {};

      const set = new ReactiveWeakSet([a, a, b, c, d]);

      const captured: any[] = [];
      createComputed(() => {
        captured.push(set.has(e));
      });
      expect(captured, "1").toEqual([false]);

      set.add(e);
      expect(captured, "2").toEqual([false, true]);

      set.delete(e);
      expect(captured, "3").toEqual([false, true, false]);

      set.delete(a);
      expect(captured, "4").toEqual([false, true, false]);

      set.add(a);
      expect(captured, "5").toEqual([false, true, false]);

      set.add(e);
      expect(captured, "6").toEqual([false, true, false, true]);

      dispose();
    });
  });
});
