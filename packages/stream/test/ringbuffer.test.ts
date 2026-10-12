import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createStreamRingBuffer } from "../src/ringbuffer";

describe("createStreamRingBuffer", () => {
  it("initializes with capacity and empty buffer", () => {
    createRoot(dispose => {
      const stream = createStreamRingBuffer(128);
      expect(stream.available()).toBe(0);
      dispose();
    });
  });
});
