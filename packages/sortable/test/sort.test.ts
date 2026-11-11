import { describe, test, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { makeSorted, createSorted, ascending, descending, by } from "../src/index.ts";

describe("makeSorted", () => {
  test("returns a new sorted copy without mutating the input", () => {
    const original = [3, 1, 2];
    const result = makeSorted(original);
    expect(result).toEqual([1, 2, 3]);
    expect(original).toEqual([3, 1, 2]);
  });
});

describe("createSorted", () => {
  test("sorts reactively and returns a new array each recompute (non-dirty)", () => {
    const [list, setList] = createSignal([3, 1, 2]);
    const [dispose, sorted] = createRoot(dispose => [dispose, createSorted(list)] as const);

    flush();
    expect(sorted()).toEqual([1, 2, 3]);
    const first = sorted();

    setList([5, 4, 6]);
    flush();
    expect(sorted()).toEqual([4, 5, 6]);
    expect(sorted()).not.toBe(first);
    dispose();
  });

  test("does not mutate the source array (non-dirty)", () => {
    const original = [3, 1, 2];
    const [list] = createSignal(original);
    const [dispose, sorted] = createRoot(dispose => [dispose, createSorted(list)] as const);

    flush();
    sorted();
    expect(original).toEqual([3, 1, 2]);
    dispose();
  });

  test("dirty mode mutates the source array in place and reuses its reference", () => {
    const original = [3, 1, 2];
    const [list] = createSignal(original);
    const [dispose, sorted] = createRoot(
      dispose => [dispose, createSorted(list, ascending, { dirty: true })] as const,
    );

    flush();
    expect(sorted()).toBe(original);
    expect(original).toEqual([1, 2, 3]);
    dispose();
  });

  test("supports a reactive comparator (direction toggle)", () => {
    const [list] = createSignal([3, 1, 2]);
    const [dir, setDir] = createSignal<"asc" | "desc">("asc");
    const comparator = () => (dir() === "asc" ? ascending : descending);
    const [dispose, sorted] = createRoot(dispose => [dispose, createSorted(list, comparator)] as const);

    flush();
    expect(sorted()).toEqual([1, 2, 3]);

    setDir("desc");
    flush();
    expect(sorted()).toEqual([3, 2, 1]);
    dispose();
  });

  test("supports a `by` comparator", () => {
    const [list] = createSignal([{ price: 3 }, { price: 1 }, { price: 2 }]);
    const [dispose, sorted] = createRoot(
      dispose => [dispose, createSorted(list, by((i: { price: number }) => i.price))] as const,
    );

    flush();
    expect(sorted().map(i => i.price)).toEqual([1, 2, 3]);
    dispose();
  });
});
