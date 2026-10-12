import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createVectorTween } from "../src/vector";

describe("createVectorTween", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with target vector coordinates", () => {
    createRoot(dispose => {
      const [pos] = createSignal({ x: 10, y: 20 });
      const tweened = createVectorTween(pos, { duration: 200 });
      expect(tweened()).toEqual({ x: 10, y: 20 });
      dispose();
    });
  });
});
