import { describe, test, it, expect } from "vitest";
import { ReactiveSet, ReactiveWeakSet } from "../src";
import { createComputed, createRoot } from "solid-js";

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

      let captured: any[] = [];
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
});

describe("ReactiveWeakSet", () => {
  test("behaves like a WeakSet", () => {
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
});
