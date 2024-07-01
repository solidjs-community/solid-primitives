import { describe, it, expect, vi } from "vitest";
import { createMs, createRAF, targetFPS } from "../src/index.js";
import { createRoot } from "solid-js";

describe("createRAF", () => {
  it("calls requestAnimationFrame after start", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    createRoot(() => {
      const [running, start, stop] = createRAF(ts => {
        expect(typeof ts === "number");
      });
      expect(running()).toBe(false);
      expect(raf).not.toHaveBeenCalled();
      start();
      expect(running()).toBe(true);
      expect(raf).toHaveBeenCalled();
      stop();
    });
  });
});

describe("targetFPS", () => {
  it("only calls after a frame", () => {
    const callback = vi.fn();
    const fpsFilter = targetFPS(callback, 60);
    expect(callback).not.toHaveBeenCalled();
    fpsFilter(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    fpsFilter(1017);
    expect(callback).toHaveBeenCalledTimes(2);
    fpsFilter(1024);
    expect(callback).toHaveBeenCalledTimes(2);
    fpsFilter(1034);
    expect(callback).toHaveBeenCalledTimes(3);
  });
});

describe("createMs", () => {
  it("yields a timestamp starting at approximately zero", () => {
    createRoot(() => {
      const ms = createMs(60);
      expect(ms()).toBeLessThanOrEqual(3);
      ms.stop();
    });
  });
});
