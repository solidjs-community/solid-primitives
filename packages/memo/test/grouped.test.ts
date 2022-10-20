import { describe, test, expect } from "vitest";
import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import { createDebouncedMemo, createDebouncedMemoOn, createThrottledMemo } from "../src";

describe("createThrottledMemo", () => {
  test("writes to signal are throttled", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const capturedPrev: any[] = [];
      const memo = createThrottledMemo(prev => {
        capturedPrev.push(prev);
        return count();
      }, 0);
      expect(memo()).toBe(0);
      expect(capturedPrev).toEqual([undefined]);
      setTimeout(() => {
        setCount(1);
        setCount(2);
        expect(memo()).toBe(0);
        setTimeout(() => {
          expect(memo()).toBe(2);
          expect(capturedPrev).toEqual([undefined, 0]);
          dispose();
        }, 0);
      }, 0);
    }));

  test("changing initial value", () =>
    createRoot(dispose => {
      const capturedPrev: any[] = [];
      const memo = createThrottledMemo(
        prev => {
          capturedPrev.push(prev);
          return 123;
        },
        0,
        0
      );
      expect(memo()).toBe(123);
      expect(capturedPrev).toEqual([0]);
      dispose();
    }));

  test("execution order is the same even when batched", () => {
    createRoot(dispose => {
      const order: number[] = [];
      createThrottledMemo(() => order.push(1), 0);
      createMemo(() => order.push(2));
      expect(order).toEqual([1, 2]);
      dispose();
    });
    createRoot(dispose => {
      createEffect(() => {
        const order: number[] = [];
        createThrottledMemo(() => order.push(1), 0);
        createMemo(() => order.push(2));
        expect(order).toEqual([1, 2]);
        dispose();
      });
    });
  });
});

describe("createDebouncedMemo", () => {
  test("writes to signal are debounced", () =>
    createRoot(dispose => {
      let runs = 0;
      const [count, setCount] = createSignal(0);
      const memo = createDebouncedMemo(() => {
        runs++;
        return count();
      }, 50);
      expect(memo()).toBe(0);
      expect(runs).toBe(1);
      setTimeout(() => {
        expect(memo()).toBe(0);
        expect(runs).toBe(1);
        setCount(1);
        setTimeout(() => {
          expect(memo()).toBe(0);
          expect(runs).toBe(2);
          setCount(2);
          setTimeout(() => {
            expect(memo()).toBe(0);
            expect(runs).toBe(3);
            setCount(3);
            setTimeout(() => {
              expect(memo()).toBe(3);
              expect(runs).toBe(4);
              dispose();
            }, 200);
          }, 10);
        }, 10);
      }, 10);
    }));

  test("execution order is the same even when batched", () => {
    createRoot(dispose => {
      const order: number[] = [];
      createDebouncedMemo(() => order.push(1), 0);
      createMemo(() => order.push(2));
      expect(order).toEqual([1, 2]);
      dispose();
    });
    createRoot(dispose => {
      createEffect(() => {
        const order: number[] = [];
        createDebouncedMemo(() => order.push(1), 0);
        createMemo(() => order.push(2));
        expect(order).toEqual([1, 2]);
        dispose();
      });
    });
  });
});

describe("createDebouncedMemoOn", () => {
  test("callback is debounced", () =>
    createRoot(dispose => {
      let runs = 0;
      const [count, setCount] = createSignal(0);
      const memo = createDebouncedMemoOn(
        count,
        v => {
          runs++;
          return v;
        },
        50
      );
      expect(memo()).toBe(0);
      expect(runs).toBe(1);
      setTimeout(() => {
        expect(memo()).toBe(0);
        expect(runs).toBe(1);
        setCount(1);
        setTimeout(() => {
          expect(memo()).toBe(0);
          expect(runs).toBe(1);
          setCount(2);
          setTimeout(() => {
            expect(memo()).toBe(0);
            expect(runs).toBe(1);
            setCount(3);
            setTimeout(() => {
              expect(memo()).toBe(3);
              expect(runs).toBe(2);
              dispose();
            }, 200);
          }, 10);
        }, 10);
      }, 10);
    }));

  test("execution order is the same even when batched", () => {
    createRoot(dispose => {
      const order: number[] = [];
      createDebouncedMemoOn([], () => order.push(1), 0);
      createMemo(() => order.push(2));
      expect(order).toEqual([1, 2]);
      dispose();
    });
    createRoot(dispose => {
      createEffect(() => {
        const order: number[] = [];
        createDebouncedMemoOn([], () => order.push(1), 0);
        createMemo(() => order.push(2));
        expect(order).toEqual([1, 2]);
        dispose();
      });
    });
  });
});
