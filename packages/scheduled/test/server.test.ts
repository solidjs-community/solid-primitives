import { createSignal, flush } from "solid-js";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import {
  createDebounced,
  createThrottled,
  debounce,
  leading,
  leadingAndTrailing,
  scheduleIdle,
  throttle,
} from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("on server", () => {
  const DATA: [string, (cb: (a: any) => void, time: number) => (a: any) => void][] = [
    ["debounce", (cb, time) => debounce(cb, time)],
    ["throttle", (cb, time) => throttle(cb, time)],
    ["scheduleIdle", (cb, time) => scheduleIdle(cb, time)],
  ];

  DATA.forEach(([name, fn]) => {
    test(`${name} is noop`, () => {
      const cb = vi.fn();
      const trigger = fn(cb, 100);
      trigger("foo");
      expect(cb).not.toHaveBeenCalled();
      vi.runAllTimers();
      expect(cb).not.toHaveBeenCalled();
    });
  });

  test("leading is noop", () => {
    const cb = vi.fn();
    const trigger = leading(debounce, cb, 100);
    trigger("foo");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("foo");
    vi.runAllTimers();
    trigger("baz");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("leadingAndTrailing is noop", () => {
    const cb = vi.fn();
    const trigger = leadingAndTrailing(debounce, cb, 100);
    trigger("foo");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("foo");
    vi.runAllTimers();
    trigger("baz");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("createDebounced passes through without scheduling", () => {
    const [source, setSource] = createSignal("a");
    const value = createDebounced(source, 100, { maxWait: 1_000 });

    expect(value()).toBe("a");

    setSource("b");
    flush();

    expect(vi.getTimerCount()).toBe(0);
  });

  test("createThrottled passes through without scheduling", () => {
    const [source, setSource] = createSignal("a");
    const value = createThrottled(source, 100);

    expect(value()).toBe("a");

    setSource("b");
    flush();

    expect(vi.getTimerCount()).toBe(0);
  });
});
