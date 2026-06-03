import { describe, it, expect, vi } from "vitest";
import { createRcMemo } from "../src/index.js";
import { createComputed, createContext, createRoot, createSignal, getOwner, onCleanup, useContext } from "solid-js";

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const nextTick = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("createRcMemo", () => {
  it("only creates a memo when there are listeners", async () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    const memo = createRcMemo(() => {
      runs++;
      return count();
    });

    expect(runs).toBe(0);

    // Initial access without listener
    expect(memo()).toBe(0);
    expect(runs).toBe(1);

    setCount(1);
    // Still 1 because it's not tracking without listener
    expect(runs).toBe(1);
    expect(memo()).toBe(1);
    expect(runs).toBe(2);

    // Add listener
    await createRoot(async dispose => {
      createComputed(() => {
        memo();
      });
      expect(runs).toBe(3);

      setCount(2);
      expect(runs).toBe(4);
      expect(memo()).toBe(2);
      expect(runs).toBe(4); // Should be memoized

      dispose();
      await nextTick();
    });

    // After disposal and microtask, memo should be gone
    setCount(3);
    expect(runs).toBe(4);
    expect(memo()).toBe(3);
    expect(runs).toBe(5);
  });

  it("disposes the memo after a microtask when there are no listeners", async () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let disposed = false;
    const memo = createRcMemo(() => {
      runs++;
      onCleanup(() => {
        disposed = true;
      });
      return count();
    });

    await createRoot(async dispose => {
      createComputed(() => {
        memo();
      });
      expect(runs).toBe(1);
      expect(disposed).toBe(false);

      dispose();
      expect(disposed).toBe(false); // Not yet disposed, waiting for microtask

      await nextTick();
      expect(disposed).toBe(true);
    });
  });

  it("keeps the memo alive if a new listener is added within the same microtask", async () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let disposed = false;
    const memo = createRcMemo(() => {
      runs++;
      onCleanup(() => {
        disposed = true;
      });
      return count();
    });

    const dispose1 = createRoot(dispose => {
      createComputed(() => {
        memo();
      });
      return dispose;
    });

    expect(runs).toBe(1);
    dispose1();

    // Before microtask, add another listener
    createRoot(dispose => {
      createComputed(() => {
        memo();
      });
      // Should reuse existing memo
      expect(runs).toBe(1);
      expect(disposed).toBe(false);
      dispose();
    });

    await nextTick();
    expect(disposed).toBe(true);
  });

  it("supports multiple listeners", async () => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    let disposed = false;
    const memo = createRcMemo(() => {
      runs++;
      onCleanup(() => {
        disposed = true;
      });
      return count();
    });

    const dispose1 = createRoot(dispose => {
      createComputed(() => {
        memo();
      });
      return dispose;
    });

    const dispose2 = createRoot(dispose => {
      createComputed(() => {
        memo();
      });
      return dispose;
    });

    expect(runs).toBe(1);

    dispose1();
    await nextTick();
    expect(disposed).toBe(false);

    dispose2();
    await nextTick();
    expect(disposed).toBe(true);
  });

  it("passes context to the inner memo", async () => {
    const MyContext = createContext(123);
    let capturedContext: any;
    
    const { memo, dispose } = createRoot(dispose => {
      const memo = createRcMemo(() => {
        capturedContext = useContext(MyContext);
        return 0;
      });
      return { memo, dispose };
    });

    createRoot(dis => {
      createComputed(() => {
        memo();
      });
      dis();
    });

    expect(capturedContext).toBe(123);

    dispose();
  });

  it("persists the last seen value as initial value for the next recreation", async () => {
    const [count, setCount] = createSignal(0);
    let capturedPrev: any;
    const memo = createRcMemo(prev => {
      capturedPrev = prev;
      return count();
    });

    // 1st life
    await createRoot(async dispose => {
      createComputed(() => memo());
      expect(capturedPrev).toBeUndefined();
      setCount(1);
      expect(capturedPrev).toBe(0);
      dispose();
      await nextTick();
    });

    // 2nd life
    await createRoot(async dispose => {
      createComputed(() => memo());
      expect(capturedPrev).toBe(1); // Should have persisted the last value
      dispose();
      await nextTick();
    });
  });
});
