import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { createEffect, createRoot, createSignal } from "solid-js";
import { createIsMounted, isHydrated, onInitialRender, onDeferred } from "../src/index.js";

describe("createIsMounted", () => {
  test("createIsMounted", () => {
    createRoot(dispose => {
      const isMounted = createIsMounted();
      expect(isMounted()).toBe(false);

      createEffect(() => {
        expect(isMounted()).toBe(true);
        dispose();
      });
    });

    expect(createIsMounted()()).toBe(true);
  });
});

describe("isHydrated", () => {
  test("isHydrated", () => {
    expect(isHydrated()).toBe(true);
  });
});

describe("onInitialRender", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("executes callback asynchronously in the next microtask after mount", async () => {
    const fn = vi.fn();

    createRoot(dispose => {
      onInitialRender(fn);
      expect(fn).not.toHaveBeenCalled();
      dispose();
    });

    await vi.runAllTicksAsync();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("preserves reactive signal scope inside the owner hierarchy", async () => {
    let capturedValue = "";

    createRoot(dispose => {
      const [name] = createSignal("SolidJS");

      onInitialRender(() => {
        capturedValue = name();
      });

      dispose();
    });

    await vi.runAllTicksAsync();
    expect(capturedValue).toBe("SolidJS");
  });

  test("does not execute if component is unmounted prior to microtask execution", async () => {
    const fn = vi.fn();

    const dispose = createRoot(disposeFn => {
      onInitialRender(fn);
      return disposeFn;
    });

    dispose();
    await vi.runAllTicksAsync();

    expect(fn).not.toHaveBeenCalled();
  });
});

describe("onDeferred", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("executes callback after specified delay", () => {
    const fn = vi.fn();

    createRoot(dispose => {
      onDeferred(fn, 500);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(499);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  test("cancels execution if disposed before delay expires", () => {
    const fn = vi.fn();

    createRoot(dispose => {
      onDeferred(fn, 500);
      vi.advanceTimersByTime(200);
      dispose();
    });

    vi.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();
  });

  test("supports manual cancellation via returned handle", () => {
    const fn = vi.fn();

    createRoot(dispose => {
      const cancel = onDeferred(fn, 300);
      vi.advanceTimersByTime(100);
      cancel();
      vi.advanceTimersByTime(300);
      expect(fn).not.toHaveBeenCalled();
      dispose();
    });
  });
});
