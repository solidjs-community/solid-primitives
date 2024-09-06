import { createComputed, createEffect, createRoot, createSignal } from "solid-js";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createScheduled, debounce, leading } from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("createScheduled", () => {
  it("returns true after invalidated", () => {
    let invalidate!: VoidFunction;
    const scheduled = createScheduled(fn => {
      invalidate = fn;
      return () => {};
    });
    expect(scheduled()).toBe(false);
    invalidate();
    expect(scheduled()).toBe(true);
  });

  it("triggers observers on invalidate", () => {
    createRoot(dispose => {
      let invalidate!: VoidFunction;
      const scheduled = createScheduled(fn => {
        invalidate = fn;
        return () => {};
      });
      let i = 0;
      const [track, trigger] = createSignal(undefined, { equals: false });
      createComputed(() => {
        i++;
        track();
        expect(scheduled()).toBe(i === 3);
        if (i === 1) return trigger();
        if (i === 2) return invalidate();
        dispose();
      });
    });
  });

  it("debounces", () => {
    const [track, trigger] = createSignal(undefined, { equals: false });

    let i = 0;
    let value: boolean | undefined;

    const dispose = createRoot(dispose => {
      const scheduled = createScheduled(fn => debounce(fn, 20));

      createEffect(() => {
        track();
        i++;
        value = scheduled();
      });

      return dispose;
    });

    expect(value).toBe(false);
    expect(i).toBe(1);

    trigger();

    expect(value).toBe(false);
    expect(i).toBe(2);

    vi.advanceTimersByTime(50);

    expect(value).toBe(true);
    expect(i).toBe(3);

    if (i === 1) return trigger();
    if (i === 2) return;
    dispose();
  });

  it("debounces with leading", () => {
    const [track, trigger] = createSignal(undefined, { equals: false });

    let i = 0;
    let value: boolean | undefined;

    const dispose = createRoot(dispose => {
      const scheduled = createScheduled(fn => leading(debounce, fn, 20));

      createEffect(() => {
        track();
        i++;
        value = scheduled();
      });

      return dispose;
    });

    expect(value).toBe(true);
    expect(i).toBe(1);

    trigger();

    expect(value).toBe(false);
    expect(i).toBe(2);

    vi.advanceTimersByTime(50);

    expect(value).toBe(false);
    expect(i).toBe(2);

    dispose();
  });

  it("works with multiple computations", () => {
    createRoot(dispose => {
      let invalidate!: VoidFunction;
      const scheduled = createScheduled(fn => {
        invalidate = fn;
        return () => {};
      });
      let i = 0;
      const [track, trigger] = createSignal(undefined, { equals: false });
      createComputed(() => {
        i++;
        track();
        expect(scheduled(), `(a) run ${i}`).toBe(i === 3);
        if (i === 1) return;
        if (i === 2) return;
      });
      let j = 0;
      createComputed(() => {
        j++;
        track();
        expect(scheduled(), `(b) run ${j}`).toBe(j === 3);
        if (j === 1) return trigger();
        if (j === 2) return invalidate();
      });
      dispose();
    });
  });
});
