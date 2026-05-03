import { createEffect, createRoot, createSignal, flush } from "solid-js";
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
      const vals: boolean[] = [];
      // ownedWrite: true because trigger() is called inside the createRoot scope
      const [track, trigger] = createSignal(undefined, { equals: false, ownedWrite: true });

      createEffect(
        () => { track(); return scheduled(); },
        val => { vals.push(val); },
      );

      flush(); // run 1: subscribed, not yet dirty
      expect(vals).toEqual([false]);

      trigger();
      flush(); // run 2: re-run due to user signal, call() is noop here
      expect(vals).toEqual([false, false]);

      invalidate(); // sets isDirty + writes track signal
      flush(); // run 3: dirty → returns true
      expect(vals).toEqual([false, false, true]);

      dispose();
    });
  });

  it("debounces", () => {
    const [track, trigger] = createSignal(undefined, { equals: false });
    const vals: boolean[] = [];

    const dispose = createRoot(dispose => {
      const scheduled = createScheduled(fn => debounce(fn, 20));

      createEffect(
        () => { track(); return scheduled(); },
        val => { vals.push(val); },
      );

      return dispose;
    });

    flush(); // initial run
    expect(vals).toEqual([false]);

    trigger();
    flush(); // re-run, debounce timer started
    expect(vals).toEqual([false, false]);

    vi.advanceTimersByTime(50); // debounce fires → isDirty=true, dirty()
    flush(); // re-run after invalidation
    expect(vals).toEqual([false, false, true]);

    dispose();
  });

  it("debounces with leading", () => {
    const [track, trigger] = createSignal(undefined, { equals: false });
    const vals: boolean[] = [];

    const dispose = createRoot(dispose => {
      const scheduled = createScheduled(fn => leading(debounce, fn, 20));

      createEffect(
        () => { track(); return scheduled(); },
        val => { vals.push(val); },
      );

      return dispose;
    });

    // Leading fires fn() synchronously in Run 1: isDirty=true → returns true, isDirty=false.
    // dirty() write is deferred until the next flush (Solid 2.0 prevents same-flush loops).
    flush();
    expect(vals).toEqual([true]);

    // trigger() causes a new flush. The effect re-runs: leading already scheduled (isScheduled=true)
    // so fn is NOT re-fired → returns false.
    trigger();
    flush();
    expect(vals).toEqual([true, false]);

    // The debounce trailing edge resets isScheduled but does NOT call fn → no dirty() call.
    vi.advanceTimersByTime(50);
    flush();
    expect(vals).toEqual([true, false]);

    dispose();
  });

  it("works with multiple computations", () => {
    createRoot(dispose => {
      let invalidate!: VoidFunction;
      const scheduled = createScheduled(fn => {
        invalidate = fn;
        return () => {};
      });
      const vals_a: boolean[] = [];
      const vals_b: boolean[] = [];
      // ownedWrite: true because trigger() is called inside the createRoot scope
      const [track, trigger] = createSignal(undefined, { equals: false, ownedWrite: true });

      createEffect(
        () => { track(); return scheduled(); },
        val => { vals_a.push(val); },
      );

      createEffect(
        () => { track(); return scheduled(); },
        val => { vals_b.push(val); },
      );

      flush(); // initial runs
      expect(vals_a).toEqual([false]);
      expect(vals_b).toEqual([false]);

      trigger();
      flush(); // re-runs after user trigger
      expect(vals_a).toEqual([false, false]);
      expect(vals_b).toEqual([false, false]);

      invalidate();
      flush(); // both re-run after invalidation
      expect(vals_a).toEqual([false, false, true]);
      expect(vals_b).toEqual([false, false, true]);

      dispose();
    });
  });
});
