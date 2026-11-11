import { describe, test, expect } from "vitest";
import { createRoot, createSignal, createEffect, flush } from "solid-js";
import { createSortedIndex, ascending } from "../src/index.ts";

describe("createSortedIndex", () => {
  test("reflects each item's position in the sorted list", () => {
    createRoot(dispose => {
      const a = { name: "b" };
      const b = { name: "a" };
      const [list] = createSignal([a, b]);
      const indexOf = createSortedIndex(list, (x: typeof a, y: typeof a) => ascending(x.name, y.name));
      flush();
      expect(indexOf(a)()).toBe(1);
      expect(indexOf(b)()).toBe(0);
      dispose();
    });
  });

  test("returns -1 for an item that isn't present", () => {
    createRoot(dispose => {
      const a = { name: "a" };
      const missing = { name: "z" };
      const [list] = createSignal([a]);
      const indexOf = createSortedIndex(list, (x: typeof a, y: typeof a) => ascending(x.name, y.name));
      flush();
      expect(indexOf(missing)()).toBe(-1);
      dispose();
    });
  });

  test("an item's index accessor only re-runs when that item's own position changes", () => {
    // Sorted by name: a(0), b(1), c(2), d(3), e(4)
    const a = { name: "b" };
    const b = { name: "c" };
    const c = { name: "d" };
    const d = { name: "e" };
    const e = { name: "f" };
    const [items, setItems] = createSignal([a, b, c, d, e]);

    let runsA = 0;
    let runsB = 0;
    let runsC = 0;
    let runsD = 0;
    let runsE = 0;

    const [dispose, idxA, idxB, idxC, idxD, idxE] = createRoot(dispose => {
      const indexOf = createSortedIndex(items, (x: typeof a, y: typeof a) => ascending(x.name, y.name));
      const idxA = indexOf(a);
      const idxB = indexOf(b);
      const idxC = indexOf(c);
      const idxD = indexOf(d);
      const idxE = indexOf(e);

      createEffect(
        () => {
          runsA++;
          return idxA();
        },
        () => {},
      );
      createEffect(
        () => {
          runsB++;
          return idxB();
        },
        () => {},
      );
      createEffect(
        () => {
          runsC++;
          return idxC();
        },
        () => {},
      );
      createEffect(
        () => {
          runsD++;
          return idxD();
        },
        () => {},
      );
      createEffect(
        () => {
          runsE++;
          return idxE();
        },
        () => {},
      );

      return [dispose, idxA, idxB, idxC, idxD, idxE] as const;
    });

    flush();
    expect([idxA(), idxB(), idxC(), idxD(), idxE()]).toEqual([0, 1, 2, 3, 4]);
    expect([runsA, runsB, runsC, runsD, runsE]).toEqual([1, 1, 1, 1, 1]);

    // Swap the two ends: `a` moves to the back, `e` moves to the front.
    // `b`, `c`, `d` keep their relative order and their indices unchanged.
    a.name = "z";
    e.name = "a";
    setItems(prev => [...prev]);
    flush();

    expect([idxA(), idxB(), idxC(), idxD(), idxE()]).toEqual([4, 1, 2, 3, 0]);
    expect(runsA).toBe(2);
    expect(runsE).toBe(2);
    expect(runsB).toBe(1);
    expect(runsC).toBe(1);
    expect(runsD).toBe(1);
    dispose();
  });
});
