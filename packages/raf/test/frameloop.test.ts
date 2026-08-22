import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { createFrameLoop } from "../src/frameloop";

describe("createFrameLoop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("provides running state and stop control", () => {
    createRoot(dispose => {
      const loopCallback = vi.fn();
      const { isRunning, stop, start } = createFrameLoop(loopCallback, { immediate: false });

      expect(isRunning()).toBe(false);
      start();
      expect(isRunning()).toBe(true);
      stop();
      expect(isRunning()).toBe(false);

      dispose();
    });
  });
});
