import { describe, test, expect } from "vitest";
import { makeOrientation, createOrientation } from "../src/index.js";

describe("makeOrientation (SSR)", () => {
  test("returns a no-op cleanup without throwing", () => {
    let called = false;
    const cleanup = makeOrientation(() => {
      called = true;
    });
    expect(typeof cleanup).toBe("function");
    expect(called).toBe(false);
    expect(() => cleanup()).not.toThrow();
  });
});

describe("createOrientation (SSR)", () => {
  test("returns static default state", () => {
    const { angle, type } = createOrientation();
    expect(angle()).toBe(0);
    expect(type()).toBe("portrait-primary");
  });

  test("angle and type are callable functions", () => {
    const { angle, type } = createOrientation();
    expect(typeof angle).toBe("function");
    expect(typeof type).toBe("function");
  });
});
