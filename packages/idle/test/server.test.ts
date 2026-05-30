import { describe, it, expect } from "vitest";
import { createIdleTimer } from "../src/index.js";

describe("createIdleTimer", () => {
  it("returns a no-op timer on the server", () => {
    const timer = createIdleTimer();
    expect(timer.isIdle()).toBe(false);
    expect(timer.isPrompted()).toBe(false);
    timer.start();
    timer.stop();
    timer.reset();
    timer.triggerIdle();
    expect(timer.isIdle()).toBe(false);
    expect(timer.isPrompted()).toBe(false);
  });
});
