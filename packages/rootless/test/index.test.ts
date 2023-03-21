import { describe, test, expect } from "vitest";
import {
  createComputed,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
} from "solid-js";
import { createCallback, createSubRoot, createDisposable, createSingletonRoot } from "../src";

describe("createSubRoot", () => {
  test("behaves like a root", () =>
    createSubRoot(dispose => {
      const captured: any[] = [];
      const [count, setCount] = createSignal(0);
      createComputed(() => captured.push(count()));
      setCount(1);
      expect(captured, "before dispose()").toEqual([0, 1]);
      dispose();
      setCount(2);
      expect(captured, "after dispose()").toEqual([0, 1]);
    }));

  test("disposes with owner", () =>
    createRoot(dispose => {
      createSubRoot(() => {
        const captured: any[] = [];
        const [count, setCount] = createSignal(0);
        createComputed(() => captured.push(count()));
        setCount(1);
        expect(captured, "before dispose()").toEqual([0, 1]);
        dispose();
        setCount(2);
        expect(captured, "after dispose()").toEqual([0, 1]);
      });
    }));

  test("many parent owners", () => {
    const [o1, o2, dispose1, dispose2] = createRoot(dispose1 => {
      const o1 = getOwner();
      const [o2, dispose2] = createRoot(dispose2 => {
        return [getOwner(), dispose2];
      });
      return [o1, o2, dispose1, dispose2];
    });

    createSubRoot(
      () => {
        const captured: any[] = [];
        const [count, setCount] = createSignal(0);
        createComputed(() => captured.push(count()));
        setCount(1);
        expect(captured, "before dispose()").toEqual([0, 1]);
        dispose1();
        setCount(2);
        expect(captured, "after dispose()").toEqual([0, 1]);
      },
      o1,
      o2,
    );
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
  test("working with createComputed", () => {
    const [count, setCount] = createSignal(0);
    const captured: any[] = [];
    const dispose = createDisposable(() => createComputed(() => captured.push(count())));
    expect(captured).toEqual([0]);
    setCount(1);
    expect(captured, "before dispose()").toEqual([0, 1]);
    dispose();
    expect(captured, "after disposing").toEqual([0, 1]);
  });

  test("disposes together with owner", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const captured: any[] = [];
      createDisposable(() => createComputed(() => captured.push(count())));
      expect(captured).toEqual([0]);
      setCount(1);
      expect(captured, "before dispose()").toEqual([0, 1]);
      dispose();
      expect(captured, "after disposing").toEqual([0, 1]);
    }));
});

describe("createSharedRoot", () => {
  test("single root", () => {
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

    createRoot(dispose => {
      expect(useMemo()()).toBe(0);
      expect(disposes).toBe(0);
      expect(runs).toBe(1);
      setCount(1);
      expect(runs).toBe(2);
      dispose();
      queueMicrotask(() => {
        expect(disposes).toBe(1);
        expect(runs).toBe(2);
        setCount(2);
        expect(runs).toBe(2);
      });
    });
  });

  test("multiple roots", () => {
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

    const d1 = createRoot(dispose => {
      expect(useMemo()()).toBe(0);
      return dispose;
    });

    const d2 = createRoot(dispose => {
      createEffect(() => useMemo()());
      return dispose;
    });

    expect(runs).toBe(1);
    setCount(1);
    expect(runs).toBe(2);

    d1();

    queueMicrotask(() => {
      expect(runs).toBe(2);
      expect(disposes).toBe(0);
      setCount(2);
      expect(runs).toBe(3);

      setTimeout(() => {
        d2();

        setTimeout(() => {
          expect(runs).toBe(3);
          expect(disposes).toBe(1);
          setCount(3);
          expect(runs).toBe(3);
        });
      });
    });
  });

  test("multiple dependents disposing in one tick", () =>
    createRoot(dispose => {
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

      queueMicrotask(() => {
        expect(alive).toBe(false);
        dispose();
      });
    }));
});
