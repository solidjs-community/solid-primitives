import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createSmoothScroll } from "../src/smooth";

describe("createSmoothScroll", () => {
  it("initializes with current scroll position and idle velocity", () => {
    createRoot(dispose => {
      const scroll = createSmoothScroll();
      expect(scroll.isScrolling()).toBe(false);
      expect(scroll.velocityX()).toBe(0);
      expect(scroll.velocityY()).toBe(0);
      dispose();
    });
  });
});
