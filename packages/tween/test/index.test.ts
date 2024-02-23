import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createTween from "../src/index.js";
import type { Stub } from "raf-stub";
import createStub from "raf-stub";

describe("createTween", () => {
  it("returns a signal", () => {
    createRoot(dispose => {
      const [value] = createSignal(0);
      const tweenedValue = createTween(value, {});
      expect(tweenedValue()).toBe(0);

      dispose();
    });
  });
});

describe("animation", () => {
  let rafTimer: Stub;

  beforeEach(() => {
    rafTimer = createStub();

    vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(rafTimer.add);

    vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(rafTimer.remove);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("updates when its target changes", () => {
    const [value, setValue] = createSignal(0);
    const tweenedValue = createTween(value, {});
    setValue(100);
    expect(tweenedValue()).toBe(0);
    rafTimer.flush();
    expect(tweenedValue()).toBe(100);
  });

  it("uses a linear animation by default", () => {
    const [value, setValue] = createSignal(0);
    const tweenedValue = createTween(value, { duration: 100 });
    setValue(100);
    expect(tweenedValue()).toBe(0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(25, 0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(50, 0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(75, 0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(100, 0);
  });

  it("accepts custom easing functions", () => {
    const [value, setValue] = createSignal(0);
    const tweenedValue = createTween(value, { duration: 100, ease: t => t * t });
    setValue(100);
    expect(tweenedValue()).toBe(0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(6.25, 0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(25, 0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(56.25, 0);
    rafTimer.step(1, 25);
    expect(tweenedValue()).toBeCloseTo(100, 0);
  });

  it("should not update immediately after creation", () => {
    const [value] = createSignal(0);
    createTween(value, { duration: 100 });
    expect(window.requestAnimationFrame).not.toBeCalled();
  });

  it("can be interrupted part-way through an animation", () => {
    const [value, setValue] = createSignal(0);
    const tweenedValue = createTween(value, { duration: 1000 });
    setValue(100);
    rafTimer.step(1, 600);
    expect(tweenedValue()).toBeCloseTo(60, 0);
    rafTimer.reset();
    setValue(0);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    rafTimer.step(1, 500);
    expect(tweenedValue()).toBeCloseTo(30, 0);
  });
});
