import { describe, it, expect } from "vitest";
import { flush } from "solid-js";
import { createLazyMemo } from "../src/index.js";
import { createEffect, createMemo, createRoot, createSignal, createTrackedEffect } from "solid-js";

describe("createLazyMemo", () => {
  it("won't run if not accessed", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    const dispose = createRoot(d => {
      createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    setCount(1);
    expect(runs, "0 after setCount").toBe(0);
    dispose();
  });

  it("runs after being accessed", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let memo!: () => number;
    const dispose = createRoot(d => {
      memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    setCount(1);
    expect(runs, "0 before access").toBe(0);

    expect(memo(), "memo matches the signal on the first access").toBe(1);
    expect(runs, "ran once").toBe(1);
    dispose();
  });

  it("runs only once per reactive update within a tracking context", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let memo!: () => number;
    const dispose = createRoot(d => {
      memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    setCount(1);
    expect(runs, "0 before access").toBe(0);

    // Access within a reactive context — memo runs exactly once
    let captured: number | undefined;
    const innerDispose = createRoot(d => {
      createTrackedEffect(() => {
        captured = memo();
        memo();
        memo();
      });
      return d;
    });
    flush();
    expect(captured).toBe(1);
    expect(runs, "ran once inside reactive context").toBe(1);

    innerDispose();
    dispose();
  });

  it("runs once until invalidated", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let memo!: () => number;

    const dispose = createRoot(d => {
      memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    const innerDispose1 = createRoot(d => {
      createTrackedEffect(() => void memo());
      return d;
    });
    flush();
    expect(runs, "1-1.").toBe(1);

    const innerDispose2 = createRoot(d => {
      createTrackedEffect(() => void memo());
      return d;
    });
    flush();
    expect(runs, "1-2.").toBe(1);

    memo();
    expect(runs, "1-3.").toBe(1);

    setCount(1);
    flush();
    expect(runs, "2-1.").toBe(2);

    const innerDispose3 = createRoot(d => {
      createTrackedEffect(() => void memo());
      return d;
    });
    flush();
    expect(runs, "2-2.").toBe(2);

    innerDispose1();
    innerDispose2();
    innerDispose3();
    dispose();
  });

  it("won't run if the root of where it was accessed is gone", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let memo!: () => number;

    const dispose = createRoot(d => {
      memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    createRoot(innerDispose => {
      createTrackedEffect(() => void memo());
      flush();
      innerDispose();
    });

    expect(runs, "1").toBe(1);

    setCount(1);
    flush();
    expect(runs, "2").toBe(1);
    dispose();
  });

  it("will be running even if some of the reading roots are disposed", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let memo!: () => number;

    const dispose = createRoot(d => {
      memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    const dispose1 = createRoot(d => {
      createTrackedEffect(() => void memo());
      flush();
      return d;
    });
    const dispose2 = createRoot(d => {
      createTrackedEffect(() => void memo());
      flush();
      return d;
    });

    expect(runs, "ran once").toBe(1);

    setCount(1);
    flush();
    expect(runs, "ran twice").toBe(2);

    dispose1();
    setCount(2);
    flush();
    expect(runs, "ran 3 times").toBe(3);

    dispose2();

    setCount(3);
    flush();
    expect(runs, "ran 3 times; (not changed)").toBe(3);
    dispose();
  });

  it("initial value if NOT set in options", () => {
    const [count, setCount] = createSignal(0);
    let capturedPrev: any;
    const captured: any[] = [];

    const dispose = createRoot(d => {
      const memo = createLazyMemo(prev => {
        capturedPrev = prev;
        return count();
      });
      createTrackedEffect(() => {
        captured.push(memo());
      });
      return d;
    });

    flush();
    expect(captured).toEqual([0]);
    expect(capturedPrev).toEqual(undefined);

    setCount(1);
    flush();
    expect(captured).toEqual([0, 1]);
    expect(capturedPrev).toEqual(0);

    dispose();
  });

  it("initial value if set", () => {
    const [count, setCount] = createSignal(0);
    let capturedPrev: any;
    const captured: any[] = [];

    const dispose = createRoot(d => {
      const memo = createLazyMemo(prev => {
        capturedPrev = prev;
        return count();
      }, 123);
      createTrackedEffect(() => {
        captured.push(memo());
      });
      return d;
    });

    flush();
    expect(captured).toEqual([0]);
    expect(capturedPrev).toEqual(123);

    setCount(1);
    flush();
    expect(captured).toEqual([0, 1]);
    expect(capturedPrev).toEqual(0);

    dispose();
  });

  it("handles prev value properly", () => {
    const [count, setCount] = createSignal(0);
    let capturedPrev: any;
    let memo!: () => number;

    const dispose = createRoot(d => {
      memo = createLazyMemo(prev => {
        capturedPrev = prev;
        return count();
      });
      return d;
    });

    const dis1 = createRoot(d => {
      createTrackedEffect(() => void memo());
      flush();
      return d;
    });
    expect(capturedPrev).toBe(undefined);

    setCount(1);
    flush();
    expect(capturedPrev).toBe(0);

    dis1();

    setCount(2);
    flush();
    expect(capturedPrev).toBe(0);
    expect(memo()).toBe(2);
    expect(capturedPrev).toBe(1);
    dispose();
  });

  it("works in an effect", () => {
    const [count, setCount] = createSignal(0);
    const captured: number[] = [];

    const dispose = createRoot(d => {
      const memo = createLazyMemo(count);
      createEffect(
        () => memo(),
        value => {
          captured.push(value);
        },
      );
      return d;
    });

    flush();
    expect(captured).toEqual([0]);

    setCount(1);
    flush();
    expect(captured).toEqual([0, 1]);
    dispose();
  });

  it("recomputes when resubscribed after all observers disposed", () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let memo!: () => number;

    const dispose = createRoot(d => {
      memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      return d;
    });

    createRoot(innerDispose => {
      createTrackedEffect(() => void memo());
      flush();
      innerDispose();
    });

    expect(runs).toBe(1);

    // In beta.10, lazy memos lose their dep links when unobserved
    // and recompute when a new observer subscribes
    createRoot(innerDispose => {
      createTrackedEffect(() => void memo());
      flush();
      innerDispose();
    });

    expect(runs).toBe(2);

    setCount(1);
    flush();
    // No observers, so no recompute
    expect(runs).toBe(2);

    dispose();
  });

  it("stays in sync when read in a memo", () => {
    const { dispose, setA, memo } = createRoot(dispose => {
      const [a, setA] = createSignal(1);
      const b = createLazyMemo(() => a());

      const memo = createMemo(() => {
        expect(a()).toBe(b());
      });

      return { dispose, setA, memo };
    });

    memo();
    setA(2);
    flush();
    memo();

    dispose();
  });
});
