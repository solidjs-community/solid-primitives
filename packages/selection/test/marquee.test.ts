import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createMarqueeSelection } from "../src/marquee";

describe("createMarqueeSelection", () => {
  it("initializes with empty selection state", () => {
    createRoot(dispose => {
      const marquee = createMarqueeSelection();
      expect(marquee.isSelecting()).toBe(false);
      expect(marquee.selectionRect()).toBe(null);
      expect(marquee.selectedIds()).toEqual([]);
      dispose();
    });
  });
});
