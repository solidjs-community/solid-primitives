import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import {
  ascending,
  by,
  makeSorted,
  createSorted,
  sortedIndex,
  insertSorted,
  createSortedIndex,
  createSortedProjection,
} from "../src/index.ts";

describe("sortable — SSR", () => {
  test("works without a browser environment", () =>
    createRoot(dispose => {
      expect(makeSorted([3, 1, 2])).toEqual([1, 2, 3]);
      expect(sortedIndex([1, 3, 5], 4)).toBe(2);
      expect(insertSorted([1, 3, 5], 4)).toEqual([1, 3, 4, 5]);

      const sorted = createSorted(() => [3, 1, 2]);
      expect(sorted()).toEqual([1, 2, 3]);

      const item = { id: 1, name: "a" };
      const indexOf = createSortedIndex(() => [item], ascending);
      expect(indexOf(item)()).toBe(0);

      const projected = createSortedProjection(() => [item], by((i: typeof item) => i.name), "id");
      expect(projected.map(i => i.id)).toEqual([1]);

      dispose();
    }));
});
