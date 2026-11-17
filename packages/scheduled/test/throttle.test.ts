import { createRoot } from "solid-js";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { leading, leadingAndTrailing, throttle } from "../src/index.js";

vi.useFakeTimers();

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("throttle", () => {
  test("setup and trigger throttle", () => {
    let val = 0;
    const trigger = throttle((current: number) => (val = current), 20);

    expect(val).toBe(0);

    trigger(5);
    vi.advanceTimersByTime(50);

    expect(val).toBe(5);
  });

  test("trigger multiple throttles", () => {
    let val = 0;
    const trigger = throttle((current: number) => (val = current), 20);

    trigger(5);
    trigger(1);
    vi.advanceTimersByTime(50);

    expect(val).toBe(1);
  });

  test("test clearing throttle", () => {
    let val = 0;
    const trigger = throttle((current: number) => (val = current), 20);

    trigger(5);
    trigger.clear();
    vi.advanceTimersByTime(50);

    expect(val).toBe(0);
  });

  test("keeps working after the callback throws", () => {
    const calls: number[] = [];
    const trigger = throttle((current: number) => {
      calls.push(current);
      if (current === 1) throw new Error("boom");
    }, 20);

    trigger(1);
    expect(() => vi.advanceTimersByTime(50)).toThrow("boom");

    trigger(2);
    vi.advanceTimersByTime(50);
    expect(calls).toEqual([1, 2]);
  });

  test("a call made from inside the callback is scheduled", () => {
    const calls: number[] = [];
    const trigger = throttle((current: number) => {
      calls.push(current);
      if (current < 3) trigger(current + 1);
    }, 20);

    trigger(1);
    vi.advanceTimersByTime(20);
    expect(calls).toEqual([1]);
    vi.advanceTimersByTime(20);
    expect(calls).toEqual([1, 2]);
    vi.advanceTimersByTime(20);
    expect(calls).toEqual([1, 2, 3]);
  });

  test("autoclearing throttle", () => {
    let val = 0;
    createRoot(dispose => {
      const trigger = throttle((current: number) => (val = current), 20);
      trigger(5);
      dispose();
    });

    vi.advanceTimersByTime(50);
    expect(val).toBe(0);
  });
});

describe("leading throttle", () => {
  test("setup and trigger throttle", () => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 20);
    expect(val).toBe(0);
    trigger(5);
    expect(val).toBe(5);
  });

  test("trigger multiple throttles", () => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 20);

    trigger(5);
    trigger(1);
    expect(val).toBe(5);

    trigger(10);
    vi.advanceTimersByTime(50);
    expect(val).toBe(5);

    trigger(15);
    expect(val).toBe(15);
  });

  test("clearing", () => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 20);

    trigger(5);
    trigger.clear();
    trigger(10);
    expect(val).toBe(10);
  });

  test("autoclearing", () => {
    createRoot(dispose => {
      let val = 0;
      const trigger = leading(throttle, (current: number) => (val = current), 150);

      trigger(5);
      dispose();
      trigger(10);
      expect(val).toBe(10);
    });
  });
});

describe("leadingAndTrailing throttle", () => {
  test("keeps working after the trailing call throws", () => {
    const calls: number[] = [];
    const trigger = leadingAndTrailing(
      throttle,
      (current: number) => {
        calls.push(current);
        if (current === 2) throw new Error("boom");
      },
      20,
    );

    trigger(1);
    trigger(2);
    expect(calls).toEqual([1]);
    expect(() => vi.advanceTimersByTime(50)).toThrow("boom");
    expect(calls).toEqual([1, 2]);

    trigger(3);
    expect(calls).toEqual([1, 2, 3]);
  });

  test("setup and trigger throttle", () => {
    let val = 0;
    const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 20);

    expect(val).toBe(0);
    trigger(5);
    expect(val).toBe(5);
  });

  test("throttle only called once if only triggered once", () => {
    let callCount = 0;
    const trigger = leadingAndTrailing(throttle, () => (callCount += 1), 10);

    expect(callCount).toBe(0);

    trigger();
    expect(callCount).toBe(1);

    vi.advanceTimersByTime(30);
    expect(callCount).toBe(1);
  });

  test("trigger throttles with pauses", () => {
    let val = 0;
    const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 20);

    trigger(5);
    trigger(1);
    expect(val).toBe(5);

    trigger(10);
    expect(val).toBe(5);

    vi.advanceTimersByTime(25); // sleep long enough for throttle to clear
    expect(val).toBe(10);

    trigger(15);
    expect(val).toBe(15);
  });

  test("clearing", () => {
    let val = 0;
    const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 20);

    trigger(5);
    trigger.clear();
    trigger(10);
    expect(val).toBe(10);
  });

  test("autoclearing", () => {
    createRoot(dispose => {
      let val = 0;
      const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 150);

      trigger(5);
      dispose();
      trigger(10);
      expect(val).toBe(10);
    });
  });
});
