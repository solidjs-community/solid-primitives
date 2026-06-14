import { describe, it, expect } from "vitest";

describe("gestures server", () => {
  it("exports are defined in SSR context", async () => {
    const { pan, pinch, rotate, swipe, tap, longPress, doubleTap } = await import("../src/index.js");
    expect(typeof pan).toBe("function");
    expect(typeof pinch).toBe("function");
    expect(typeof rotate).toBe("function");
    expect(typeof swipe).toBe("function");
    expect(typeof tap).toBe("function");
    expect(typeof longPress).toBe("function");
    expect(typeof doubleTap).toBe("function");
  });
});
