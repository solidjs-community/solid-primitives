import { describe, it, expect } from "vitest";
import { createLazyMemo } from "../src";
import { createComputed, createEffect, createMemo, createRoot, createSignal } from "solid-js";

describe("createLazyMemo", () => {
  it("won't run if not accessed", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;
      createLazyMemo(() => {
        runs++;
        return count();
      });
      setCount(1);
      expect(runs, "0 in setup").toBe(0);

      setTimeout(() => {
        expect(runs, "0 after timeout").toBe(0);
        setCount(2);
        expect(runs, "0 after set in timeout").toBe(0);
        dispose();
      }, 0);
    }));

  it("runs after being accessed", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;
      const memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      setCount(1);
      expect(runs, "0 in setup").toBe(0);

      expect(memo(), "memo matches the signal on the first access").toBe(1);
      expect(runs, "ran once").toBe(1);
      dispose();
    }));

  it("runs only once, even if accessed multiple times", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;
      const memo = createLazyMemo(() => {
        runs++;
        return count();
      });
      setCount(1);
      expect(runs, "0 in setup").toBe(0);

      expect(memo(), "memo matches the signal on the first access").toBe(1);
      expect(memo(), "memo matches the signal on the second access").toBe(1);
      expect(memo(), "memo matches the signal on the third access").toBe(1);
      expect(runs, "ran once").toBe(1);
      dispose();
    }));

  it("runs once until invalidated", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;

      const memo = createLazyMemo(() => {
        runs++;
        return count();
      });

      createComputed(memo);
      expect(runs, "1-1.").toBe(1);
      createComputed(memo);
      expect(runs, "1-2.").toBe(1);
      memo();
      expect(runs, "1-3.").toBe(1);

      setCount(1);
      expect(runs, "2-1.").toBe(2);

      createComputed(memo);
      expect(runs, "2-2.").toBe(2);

      dispose();
    }));

  it("won't run if the root of where it was accessed is gone", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;

      const memo = createLazyMemo(() => {
        runs++;
        return count();
      });

      createRoot(dispose => {
        createComputed(memo);
        dispose();
      });

      expect(runs, "1").toBe(1);

      setCount(1);
      expect(runs, "2").toBe(1);
      dispose();
    }));

  it("will be running even if some of the reading roots are disposed", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;
      const memo = createLazyMemo(() => {
        runs++;
        return count();
      });

      const dispose1 = createRoot(dispose => {
        createComputed(memo);
        return dispose;
      });
      const dispose2 = createRoot(dispose => {
        createComputed(memo);
        return dispose;
      });

      expect(runs, "ran once").toBe(1);

      setCount(1);

      expect(runs, "ran twice").toBe(2);

      dispose1();
      setCount(2);
      expect(runs, "ran 3 times").toBe(3);

      dispose2();

      setCount(3);
      expect(runs, "ran 3 times; (not changed)").toBe(3);
      dispose();
    }));

  it("initial value if NOT set in options", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let capturedPrev: any;
      const memo = createLazyMemo(prev => {
        capturedPrev = prev;
        return count();
      });
      const captured: any[] = [];

      createComputed(() => captured.push(memo()));
      expect(captured).toEqual([0]);
      expect(capturedPrev).toEqual(undefined);

      setCount(1);
      expect(captured).toEqual([0, 1]);
      expect(capturedPrev).toEqual(0);

      dispose();
    }));

  it("initial value if set", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let capturedPrev: any;
      const memo = createLazyMemo(prev => {
        capturedPrev = prev;
        return count();
      }, 123);
      const captured: any[] = [];

      createComputed(() => captured.push(memo()));
      expect(captured).toEqual([0]);
      expect(capturedPrev).toEqual(123);

      setCount(1);
      expect(captured).toEqual([0, 1]);
      expect(capturedPrev).toEqual(0);

      dispose();
    }));

  it("handles prev value properly", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);

      let capturedPrev: any;
      const memo = createLazyMemo(prev => {
        capturedPrev = prev;
        return count();
      });

      const dis1 = createRoot(dis => {
        createComputed(memo);
        return dis;
      });
      expect(capturedPrev).toBe(undefined);

      setCount(1);
      expect(capturedPrev).toBe(0);

      dis1();

      setCount(2);
      expect(capturedPrev).toBe(0);
      expect(memo()).toBe(2);
      expect(capturedPrev).toBe(1);
      dispose();
    }));

  it("works in an effect", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const memo = createLazyMemo(count);
      const captured: number[] = [];
      createEffect(() => captured.push(memo()));

      queueMicrotask(() => {
        expect(captured).toEqual([0]);

        setCount(1);
        queueMicrotask(() => {
          expect(captured).toEqual([0, 1]);
          dispose();
        });
      });
    }));

  it("computation will last until the source changes", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      let runs = 0;
      const memo = createLazyMemo(() => {
        runs++;
        return count();
      });

      createRoot(dispose => {
        createComputed(memo);
        dispose();
      });

      expect(runs).toBe(1);

      createRoot(dispose => {
        createComputed(memo);
        dispose();
      });

      expect(runs).toBe(1);

      setCount(1);

      expect(runs).toBe(1);

      dispose();
    }));

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
    memo();

    dispose();
  });
});
