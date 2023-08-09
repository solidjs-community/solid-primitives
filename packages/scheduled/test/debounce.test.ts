import { createRoot } from "solid-js";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { debounce, leading, leadingAndTrailing } from "../src/index.js";

vi.useFakeTimers();

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  test("setup and trigger debounce", () =>
    createRoot(dispose => {
      let val = 0;
      const fn = (current: number) => (val = current);
      const trigger = debounce(fn, 20);

      expect(val).toBe(0);
      trigger(5);

      vi.advanceTimersByTime(50);
      expect(val).toBe(5);

      dispose();
    }));

  test("trigger multiple debounce", () =>
    createRoot(dispose => {
      let val = 0;
      const trigger = debounce((current: number) => (val = current), 20);

      expect(val).toBe(0);
      trigger(5);
      trigger(1);

      vi.advanceTimersByTime(50);
      expect(val).toBe(1);

      dispose();
    }));

  test("test clearing debounce", () =>
    createRoot(dispose => {
      let val = 0;
      const trigger = debounce((current: number) => (val = current), 50);

      expect(val).toBe(0);

      trigger(5);
      trigger.clear();
      vi.advanceTimersByTime(50);

      expect(val).toBe(0);

      dispose();
    }));
});

/* eslint-disable */
function typeChecks() {
  const tc1 = debounce((n: number) => {}, 10000);
  // @ts-expect-error
  tc1();
  tc1(1);
  // @ts-expect-error
  tc1("string");
  tc1.clear();
  const tc2 = debounce((n: number | string, u: string) => {}, 10000);
  // @ts-expect-error
  tc2();
  // @ts-expect-error
  tc2(2);
  tc2(1, "");
  // @ts-expect-error
  tc1("string", 2);
  tc1.clear();
}
/* eslint-enable */

describe("leading debounce", () => {
  test("setup and trigger debounce", () =>
    createRoot(dispose => {
      let val = 0;
      const trigger = leading(debounce, (current: number) => (val = current), 20);

      expect(val).toBe(0);

      trigger(5);
      expect(val).toBe(5);

      trigger(10);
      expect(val).toBe(5);

      vi.advanceTimersByTime(50);

      trigger(15);
      expect(val).toBe(15);

      dispose();
    }));

  test("test clearing debounce", () =>
    createRoot(dispose => {
      let val = 0;
      const trigger = leading(debounce, (current: number) => (val = current), 20);

      trigger(5);
      trigger.clear();

      trigger(10);
      expect(val).toBe(10);

      dispose();
    }));
});

describe("leadingAndTrailing debounce", () => {
  test("setup and trigger debounce", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 20);

    expect(val).toBe(0);

    trigger(5);
    expect(val).toBe(5);
  });

  test("debounce only called once if only triggered once", () => {
    let callCount = 0;
    const trigger = leadingAndTrailing(debounce, () => (callCount += 1), 10);

    expect(callCount).toBe(0);

    trigger();
    expect(callCount).toBe(1);

    vi.advanceTimersByTime(30);
    expect(callCount).toBe(1);
  });

  test("trigger debounces with pauses", () => {
    let val = 0;
    const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 20);

    trigger(5);
    trigger(1);
    expect(val).toBe(5);

    vi.advanceTimersByTime(15); // do not sleep long enough for debounce to clear

    trigger(1);
    expect(val).toBe(5);
    trigger(10);
    expect(val).toBe(5);

    vi.advanceTimersByTime(25); // sleep long enough for debounce to clear

    expect(val).toBe(10);
    trigger(15);
    expect(val).toBe(15);
  });

  test("clearing", () => {
    let val = 0;
    const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 20);

    trigger(5);
    trigger.clear();
    trigger(10);
    expect(val).toBe(10);
  });

  test("autoclearing", () => {
    createRoot(dispose => {
      let val = 0;
      const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 150);

      trigger(5);
      dispose();
      trigger(10);
      expect(val).toBe(10);
    });
  });
});
