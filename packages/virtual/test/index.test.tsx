import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createVirtualList } from "../src/index";

describe("createVirtualList", () => {
  it("calculates total container height accurately with dynamic height functions", () => {
    createRoot(dispose => {
      const items = [{ h: 30 }, { h: 50 }, { h: 20 }];
      const [virtual] = createVirtualList({
        items: () => items,
        rootHeight: 100,
        rowHeight: item => item.h,
      });

      expect(virtual().containerHeight).toBe(100);
      expect(virtual().visibleItems.length).toBe(3);
      dispose();
    });
  });

  it("calculates static height containers correctly", () => {
    createRoot(dispose => {
      const items = new Array(100).fill(0);
      const [virtual] = createVirtualList({
        items: () => items,
        rootHeight: 200,
        rowHeight: 25,
      });

      expect(virtual().containerHeight).toBe(2500);
      dispose();
    });
  });
});
