import { describe, test, expect } from "vitest";
import { sortedIndex, sortedIndexBy, insertSorted, descending } from "../src/index.ts";

describe("sortedIndex", () => {
  test("finds the insertion point in a sorted array", () => {
    expect(sortedIndex([1, 3, 5, 7], 4)).toBe(2);
    expect(sortedIndex([1, 3, 5, 7], 0)).toBe(0);
    expect(sortedIndex([1, 3, 5, 7], 8)).toBe(4);
  });

  test("returns the leftmost index among duplicates", () => {
    expect(sortedIndex([1, 2, 2, 2, 3], 2)).toBe(1);
  });

  test("handles an empty array", () => {
    expect(sortedIndex([], 1)).toBe(0);
  });

  test("respects a custom comparator", () => {
    expect(sortedIndex([5, 3, 1], 4, descending)).toBe(1);
  });
});

describe("sortedIndexBy", () => {
  test("finds the insertion point by a derived key", () => {
    const items = [{ price: 1 }, { price: 3 }, { price: 5 }];
    expect(sortedIndexBy(items, { price: 4 }, i => i.price)).toBe(2);
  });
});

describe("insertSorted", () => {
  test("inserts maintaining order without mutating the input", () => {
    const original = [1, 3, 5];
    const result = insertSorted(original, 4);
    expect(result).toEqual([1, 3, 4, 5]);
    expect(original).toEqual([1, 3, 5]);
  });

  test("inserts at the start and end", () => {
    expect(insertSorted([1, 3, 5], 0)).toEqual([0, 1, 3, 5]);
    expect(insertSorted([1, 3, 5], 6)).toEqual([1, 3, 5, 6]);
  });
});
