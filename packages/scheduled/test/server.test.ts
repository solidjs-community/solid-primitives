import { describe, expect, test, vi } from "vitest";
import { debounce, leading, leadingAndTrailing, scheduleIdle, throttle } from "../src";

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
      vi.clearAllTimers();
      expect(cb).not.toHaveBeenCalled();
    });
  });

  test("leading is noop", () => {
    const cb = vi.fn();
    const trigger = leading(debounce, cb, 100);
    trigger("foo");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("foo");
    vi.clearAllTimers();
    trigger("baz");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("leadingAndTrailing is noop", () => {
    const cb = vi.fn();
    const trigger = leadingAndTrailing(debounce, cb, 100);
    trigger("foo");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("foo");
    vi.clearAllTimers();
    trigger("baz");
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
