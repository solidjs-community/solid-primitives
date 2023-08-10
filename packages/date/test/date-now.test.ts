import { describe, it, expect, afterAll, beforeEach, vi } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createDateNow } from "../src/index.js";

vi.useFakeTimers();

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("createDateNow", () => {
  it("returns an signal an update function", () => {
    const test_now = Date.now();

    const { dispose, now } = createRoot(dispose => {
      const [now] = createDateNow(100);
      return { dispose, now };
    });

    const time = now().getTime();
    expect(time > test_now - 100 && time < test_now + 100, "the date should be 'now'").toBeTruthy();

    dispose();
  });

  it("autoupdates", () => {
    const captured: number[] = [];

    const dispose = createRoot(dispose => {
      const [now] = createDateNow(100);

      createEffect(() => {
        captured.push(now().getTime());
      });

      return dispose;
    });

    expect(captured.length).toBe(1);

    vi.advanceTimersByTime(150);

    expect(captured.length).toBe(2);
    expect(
      captured[1]! - captured[0]! >= 100,
      "the newer timestamp should have bigger value",
    ).toBeTruthy();

    dispose();
  });

  it("manual updating", () => {
    const { now, update, dispose } = createRoot(dispose => {
      const [now, update] = createDateNow(() => false);
      return { now, update, dispose };
    });

    const time = now().getTime();

    vi.advanceTimersByTime(150);
    expect(time, "the time shouldn't update").toBe(now().getTime());

    update();
    expect(
      now().getTime(),
      "the timestamp after update() should have bigger value",
    ).toBeGreaterThan(time);

    dispose();
  });

  it("stop autoupdating onCleanup", () => {
    const { now, dispose } = createRoot(dispose => {
      const [now] = createDateNow(100);
      return { now, dispose };
    });

    const time = now().getTime();

    dispose();
    vi.advanceTimersByTime(150);
    expect(time, "the time shouldn't update").toBe(now().getTime());
  });
});
