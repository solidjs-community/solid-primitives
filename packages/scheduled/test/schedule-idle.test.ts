import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import type { scheduleIdle as ScheduleIdle } from "../src/index.js";

vi.useFakeTimers();

let scheduleIdle: typeof ScheduleIdle;

beforeAll(async () => {
  // requestIdleCallback is picked when the module loads, so stub it before importing
  vi.stubGlobal("requestIdleCallback", (cb: () => void, opts?: { timeout?: number }) =>
    setTimeout(cb, opts?.timeout ?? 1),
  );
  vi.stubGlobal("cancelIdleCallback", (id: ReturnType<typeof setTimeout>) => clearTimeout(id));
  vi.resetModules();
  ({ scheduleIdle } = await import("../src/index.js"));
});

afterAll(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("scheduleIdle", () => {
  test("calls the callback with the last args", () => {
    const calls: number[] = [];
    const trigger = scheduleIdle((current: number) => calls.push(current), 20);

    trigger(1);
    trigger(2);
    vi.advanceTimersByTime(20);
    expect(calls).toEqual([2]);
  });

  test("keeps working after the callback throws", () => {
    const calls: number[] = [];
    const trigger = scheduleIdle((current: number) => {
      calls.push(current);
      if (current === 1) throw new Error("boom");
    }, 20);

    trigger(1);
    expect(() => vi.advanceTimersByTime(20)).toThrow("boom");

    trigger(2);
    vi.advanceTimersByTime(20);
    expect(calls).toEqual([1, 2]);
  });

  test("a call made from inside the callback is scheduled", () => {
    const calls: number[] = [];
    const trigger = scheduleIdle((current: number) => {
      calls.push(current);
      if (current < 2) trigger(current + 1);
    }, 20);

    trigger(1);
    vi.advanceTimersByTime(20);
    vi.advanceTimersByTime(20);
    expect(calls).toEqual([1, 2]);
  });
});
