import { describe, test, expect } from "vitest";
import { makeVibrate, createVibrate, isVibrationSupported } from "../src/index.js";

describe("isVibrationSupported (SSR)", () => {
  test("returns false on the server", () => {
    expect(isVibrationSupported()).toBe(false);
  });
});

describe("makeVibrate (SSR)", () => {
  test("returns no-op functions without throwing", () => {
    const [start, stop] = makeVibrate(200);
    expect(typeof start).toBe("function");
    expect(typeof stop).toBe("function");
    expect(() => start()).not.toThrow();
    expect(() => stop()).not.toThrow();
  });
});

describe("createVibrate (SSR)", () => {
  test("returns static defaults without throwing", () => {
    const { vibrating, start, stop, supported } = createVibrate(200);
    expect(vibrating()).toBe(false);
    expect(supported).toBe(false);
    expect(typeof start).toBe("function");
    expect(typeof stop).toBe("function");
    expect(() => start()).not.toThrow();
    expect(() => stop()).not.toThrow();
  });
});
