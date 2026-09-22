import { describe, expect, it } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createCountdown } from "../src/index.js";

describe("createCountdown", () => {
  it("derives the broken-down time from a difference accessor and follows changes", () => {
    const [difference, setDifference] = createSignal(65_000);
    const { countdown, dispose } = createRoot(dispose => ({
      countdown: createCountdown(difference),
      dispose,
    }));
    expect(countdown.minutes).toBe(1);
    expect(countdown.seconds).toBe(5);

    setDifference(125_000);
    flush();
    expect(countdown.minutes).toBe(2);
    expect(countdown.seconds).toBe(5);
    dispose();
  });

  it("accepts a from/to pair", () => {
    const now = Date.now();
    const { countdown, dispose } = createRoot(dispose => ({
      countdown: createCountdown(now, now + 90_000),
      dispose,
    }));
    flush();
    expect(countdown.minutes).toBe(1);
    expect(countdown.seconds).toBe(30);
    dispose();
  });
});
