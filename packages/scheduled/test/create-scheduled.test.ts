import { createComputed, createRoot, createSignal } from "solid-js";
import { describe, it, expect } from "vitest";
import { createScheduled, debounce, leading } from "../src";

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

  it("debounces", async () => {
    await createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const scheduled = createScheduled(fn => debounce(fn, 20));
          const [track, trigger] = createSignal(undefined, { equals: false });
          let i = 0;
          createComputed(() => {
            i++;
            track();
            expect(scheduled(), `run ${i}`).toBe(i === 3);
            if (i === 1) return trigger();
            if (i === 2) return;
            resolve();
            dispose();
          });
        })
    );
  });

  it("debounces with leading", async () => {
    await createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const scheduled = createScheduled(fn => leading(debounce, fn, 20));
          let i = 0;
          const [track, trigger] = createSignal(undefined, { equals: false });
          createComputed(() => {
            i++;
            track();
            expect(scheduled(), `run ${i}`).toBe(i === 1);
            if (i === 1) return trigger();
            resolve();
            dispose();
          });
        })
    );
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
