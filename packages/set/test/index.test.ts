import { describe, test, it, expect, vi } from "vitest";
import { ReactiveSet, ReactiveWeakSet } from "../src/index.js";
import { createEffect, createRoot, flush } from "solid-js";

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
      createEffect(
        () => set.has(2),
        value => {
          captured.push(value);
        },
      );
      flush();
      expect(captured, "1").toEqual([true]);

      set.add(4);
      flush();
      expect(captured, "2").toEqual([true]);

      set.delete(4);
      flush();
      expect(captured, "3").toEqual([true]);

      set.delete(2);
      flush();
      expect(captured, "4").toEqual([true, false]);

      set.add(2);
      flush();
      expect(captured, "5").toEqual([true, false, true]);

      set.clear();
      flush();
      expect(captured, "6").toEqual([true, false, true, false]);

      dispose();
    }));

  test("spread is reactive", () =>
    createRoot(dispose => {
      const set = new ReactiveSet([1, 1, 2, 3]);

      const fn = vi.fn();
      createEffect(
        () => [...set],
        result => fn(result),
      );
      flush();
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3]);

      set.add(4);
      flush();
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3, 4]);

      set.delete(4);
      flush();
      expect(fn).toHaveBeenLastCalledWith([1, 2, 3]);

      set.delete(2);
      flush();
      expect(fn).toHaveBeenLastCalledWith([1, 3]);

      set.delete(2);
      flush();
      expect(fn).toBeCalledTimes(4);

      set.add(2);
      flush();
      expect(fn).toHaveBeenLastCalledWith([1, 3, 2]);

      set.clear();
      flush();
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
        createEffect(
          () => {
            const run: number[] = [];
            for (const key of fn(set)) {
              run.push(key);
            }
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
      expect(captured[0]).toEqual([1, 2, 3, 4]);

      set.delete(4);
      flush();
      expect(captured).toHaveLength(2);
      expect(captured[1]).toEqual([1, 2, 3]);

      set.delete(1);
      flush();
      expect(captured).toHaveLength(3);
      expect(captured[2]).toEqual([2, 3]);

      set.add(4);
      flush();
      expect(captured).toHaveLength(4);
      expect(captured[3]).toEqual([2, 3, 4]);

      set.add(5);
      flush();
      expect(captured).toHaveLength(5);
      expect(captured[4]).toEqual([2, 3, 4, 5]);

      set.add(5);
      flush();
      expect(captured).toHaveLength(5);

      set.clear();
      flush();
      expect(captured).toHaveLength(6);
      expect(captured[5]).toEqual([]);

      dispose();
    });
  }

  test("forEach is reactive", () => {
    const set = new ReactiveSet([1, 2, 3, 4]);

    const captured: number[][] = [];

    const dispose = createRoot(dispose => {
      createEffect(
        () => {
          const run: number[] = [];
          set.forEach(key => {
            run.push(key);
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
    expect(captured[0]).toEqual([1, 2, 3, 4]);

    set.delete(4);
    flush();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([1, 2, 3]);

    set.delete(1);
    flush();
    expect(captured).toHaveLength(3);
    expect(captured[2]).toEqual([2, 3]);

    set.add(4);
    flush();
    expect(captured).toHaveLength(4);
    expect(captured[3]).toEqual([2, 3, 4]);

    set.add(5);
    flush();
    expect(captured).toHaveLength(5);
    expect(captured[4]).toEqual([2, 3, 4, 5]);

    set.add(5);
    flush();
    expect(captured).toHaveLength(5);

    set.clear();
    flush();
    expect(captured).toHaveLength(6);
    expect(captured[5]).toEqual([]);

    dispose();
  });

  test("clear notifies only listeners of existing members", () =>
    createRoot(dispose => {
      const set = new ReactiveSet([1, 2, 3, 4]);

      const existing = vi.fn();
      createEffect(
        () => set.has(2),
        value => existing(value),
      );

      const nonexisting = vi.fn();
      createEffect(
        () => set.has(5),
        value => nonexisting(value),
      );

      flush();
      expect(existing).toHaveBeenNthCalledWith(1, true);
      expect(nonexisting).toHaveBeenNthCalledWith(1, false);

      set.clear();
      flush();

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
      createEffect(
        () => set.has(e),
        value => {
          captured.push(value);
        },
      );
      flush();
      expect(captured, "1").toEqual([false]);

      set.add(e);
      flush();
      expect(captured, "2").toEqual([false, true]);

      set.delete(e);
      flush();
      expect(captured, "3").toEqual([false, true, false]);

      set.delete(a);
      flush();
      expect(captured, "4").toEqual([false, true, false]);

      set.add(a);
      flush();
      expect(captured, "5").toEqual([false, true, false]);

      set.add(e);
      flush();
      expect(captured, "6").toEqual([false, true, false, true]);

      dispose();
    });
  });
});
