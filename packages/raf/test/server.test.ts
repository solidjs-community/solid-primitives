import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createMs, createRAF, targetFPS } from "../src/index.js";

describe("createRAF", () => {
  it("returns a stopped, noop RAF on the server", () => {
    const [running, start, stop] = createRAF(() => {});
    expect(running()).toBe(false);
    start();
    expect(running()).toBe(false);
    stop();
  });
});

describe("targetFPS", () => {
  it("returns the callback unchanged on the server", () => {
    const cb = () => {};
    expect(targetFPS(cb, 60)).toBe(cb);
  });
});

describe("createMs", () => {
  it("yields zero on the server", () => {
    createRoot(dispose => {
      const ms = createMs(60);
      expect(ms()).toBe(0);
      dispose();
    });
  });
});
