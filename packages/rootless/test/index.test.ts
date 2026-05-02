import { describe, test, expect } from "vitest";
import {
  createMemo,
  createRoot,
  createSignal,
  createTrackedEffect,
  flush,
  getOwner,
  onCleanup,
} from "solid-js";
import {
  createCallback,
  createSubRoot,
  createDisposable,
  createSingletonRoot,
} from "../src/index.js";

describe("createSubRoot", () => {
  test("behaves like a root", () => {
    const captured: any[] = [];
    const [count, setCount] = createSignal(0);
    const dispose = createSubRoot(dispose => {
      createTrackedEffect(() => {
        captured.push(count());
      });
      return dispose;
    });
    flush();
    expect(captured).toEqual([0]);
    setCount(1);
    flush();
    expect(captured, "before dispose()").toEqual([0, 1]);
    dispose();
    setCount(2);
    flush();
    expect(captured, "after dispose()").toEqual([0, 1]);
  });

  test("disposes with owner", () => {
    const captured: any[] = [];
    const [count, setCount] = createSignal(0);
    const dispose = createRoot(dispose => {
      createSubRoot(() => {
        createTrackedEffect(() => {
          captured.push(count());
        });
      });
      return dispose;
    });
    flush();
    expect(captured).toEqual([0]);
    setCount(1);
    flush();
    expect(captured, "before dispose()").toEqual([0, 1]);
    dispose();
    setCount(2);
    flush();
    expect(captured, "after dispose()").toEqual([0, 1]);
  });

  test("many parent owners", () => {
    const captured: any[] = [];
    const [count, setCount] = createSignal(0);

    const [o1, o2, dispose1, dispose2] = createRoot(dispose1 => {
      const o1 = getOwner();
      const [o2, dispose2] = createRoot(dispose2 => {
        return [getOwner(), dispose2];
      });
      return [o1, o2, dispose1, dispose2];
    });

    createSubRoot(
      () => {
        createTrackedEffect(() => {
          captured.push(count());
        });
      },
      o1,
      o2,
    );
    flush();
    expect(captured).toEqual([0]);
    setCount(1);
    flush();
    expect(captured, "before dispose()").toEqual([0, 1]);
    dispose1();
    setCount(2);
    flush();
    expect(captured, "after dispose()").toEqual([0, 1]);
    dispose2();
  });
});

describe("createCallback", () => {
  test("owner is available in async trigger", () =>
    createRoot(dispose => {
      let capturedPayload: any;
      let capturedOwner: any;
      const handler = createCallback(payload => {
        capturedPayload = payload;
        capturedOwner = getOwner();
      });

      setTimeout(() => {
        handler(123);
        expect(capturedPayload).toBe(123);
        expect(capturedOwner).not.toBe(null);
        dispose();
      }, 0);
    }));
});

describe("createDisposable", () => {
  test("working with createTrackedEffect", () => {
    const [count, setCount] = createSignal(0);
    const captured: any[] = [];
    const dispose = createDisposable(() =>
      createTrackedEffect(() => {
        captured.push(count());
      }),
    );
    flush();
    expect(captured).toEqual([0]);
    setCount(1);
    flush();
    expect(captured, "before dispose()").toEqual([0, 1]);
    dispose();
    setCount(2);
    flush();
    expect(captured, "after disposing").toEqual([0, 1]);
  });

  test("disposes together with owner", () => {
    const [count, setCount] = createSignal(0);
    const captured: any[] = [];
    const dispose = createRoot(dispose => {
      createDisposable(() =>
        createTrackedEffect(() => {
          captured.push(count());
        }),
      );
      return dispose;
    });
    flush();
    expect(captured).toEqual([0]);
    setCount(1);
    flush();
    expect(captured, "before dispose()").toEqual([0, 1]);
    dispose();
    setCount(2);
    flush();
    expect(captured, "after disposing").toEqual([0, 1]);
  });
});

describe("createSharedRoot", () => {
  test("single root", async () => {
    const [count, setCount] = createSignal(0);

    let runs = 0;
    let disposes = 0;
    const useMemo = createSingletonRoot(() => {
      onCleanup(() => disposes++);
      return createMemo(() => {
        runs++;
        return count();
      });
    });

    let dispose!: VoidFunction;
    createRoot(d => {
      const memo = useMemo();
      createTrackedEffect(() => void memo());
      dispose = d;
    });

    flush();
    expect(disposes).toBe(0);
    expect(runs).toBe(1);

    setCount(1);
    flush();
    expect(runs).toBe(2);

    dispose();

    await Promise.resolve();
    expect(disposes).toBe(1);
    expect(runs).toBe(2);

    setCount(2);
    flush();
    expect(runs).toBe(2);
  });

  test("multiple roots", async () => {
    const [count, setCount] = createSignal(0);

    let runs = 0;
    let disposes = 0;
    const useMemo = createSingletonRoot(() => {
      onCleanup(() => disposes++);
      return createMemo(() => {
        runs++;
        return count();
      });
    });

    let d1!: VoidFunction;
    createRoot(d => {
      const memo = useMemo();
      createTrackedEffect(() => void memo());
      d1 = d;
    });

    let d2!: VoidFunction;
    createRoot(d => {
      const memo = useMemo();
      createTrackedEffect(() => void memo());
      d2 = d;
    });

    flush();
    expect(runs).toBe(1);

    setCount(1);
    flush();
    expect(runs).toBe(2);

    d1();

    await Promise.resolve();
    expect(runs).toBe(2);
    expect(disposes).toBe(0);

    setCount(2);
    flush();
    expect(runs).toBe(3);

    d2();

    await Promise.resolve();
    expect(runs).toBe(3);
    expect(disposes).toBe(1);

    setCount(3);
    flush();
    expect(runs).toBe(3);
  });

  test("multiple dependents disposing in one tick", async () => {
    let alive = false;
    const track = createSingletonRoot(() => {
      alive = true;
      onCleanup(() => (alive = false));
    });

    const d1 = createRoot(d1 => {
      track();
      return d1;
    });

    const d2 = createRoot(d2 => {
      track();
      return d2;
    });

    expect(alive).toBe(true);
    d1();
    d2();

    await Promise.resolve();
    expect(alive).toBe(false);
  });
});
