import { describe, test, expect } from "vitest";
import { createRoot, createSignal, createEffect, flush } from "solid-js";
import { createSortedProjection, by } from "../src/index.ts";

type Row = { id: number; name: string; note: string };

describe("createSortedProjection", () => {
  test("returns a store-shaped sorted view", () => {
    createRoot(dispose => {
      const [items] = createSignal<{ id: number; name: string }[]>([
        { id: 1, name: "b" },
        { id: 2, name: "a" },
      ]);
      const sorted = createSortedProjection(items, by((i: { id: number; name: string }) => i.name), "id");
      flush();
      expect(sorted.map(i => i.id)).toEqual([2, 1]);
      dispose();
    });
  });

  test("reconciles by key: an unrelated row's field change doesn't notify other rows", () => {
    const [items, setItems] = createSignal<Row[]>([
      { id: 1, name: "a", note: "" },
      { id: 2, name: "b", note: "" },
    ]);

    let runs = 0;

    const dispose = createRoot(dispose => {
      const sorted = createSortedProjection(items, by((i: Row) => i.name), "id");
      createEffect(
        () => {
          runs++;
          return sorted.find(i => i.id === 2)!.name;
        },
        () => {},
      );
      return dispose;
    });

    flush();
    expect(runs).toBe(1);

    // Change row 1's `note` only — its `name`/order is untouched, and row 2 (`id: 2`) is
    // completely unrelated to the change.
    setItems([
      { id: 1, name: "a", note: "edited" },
      { id: 2, name: "b", note: "" },
    ]);
    flush();
    expect(runs).toBe(1);
    dispose();
  });
});
