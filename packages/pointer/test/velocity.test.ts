import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createPointerVelocity } from "../src/velocity";

describe("createPointerVelocity", () => {
  it("initializes with 0 velocity vector in node environment", () => {
    createRoot(dispose => {
      const vel = createPointerVelocity();
      expect(vel()).toEqual({ vx: 0, vy: 0, speed: 0 });
      dispose();
    });
  });
});
