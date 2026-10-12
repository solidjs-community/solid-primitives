import { describe, it, expect } from "vitest";
import { ColumnMinHeap } from "../src/heap";

describe("ColumnMinHeap", () => {
  it("always routes item to the shortest column in O(log K)", () => {
    const heap = new ColumnMinHeap(3);
    expect(heap.min.columnIndex).toBe(0);

    expect(heap.addHeight(100)).toBe(0);
    expect(heap.min.columnIndex).toBe(1);

    expect(heap.addHeight(50)).toBe(1);
    expect(heap.min.columnIndex).toBe(2);

    expect(heap.addHeight(75)).toBe(2);
    expect(heap.min.columnIndex).toBe(1); // column 1 has height 50
  });
});
