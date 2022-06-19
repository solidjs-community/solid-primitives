import { createDebouncedMemo, createThrottledMemo } from "../src";
import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const thr = suite("createThrottledMemo");

thr("writes to signal are throttled", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const capturedPrev: any[] = [];
    const memo = createThrottledMemo(prev => {
      capturedPrev.push(prev);
      return count();
    }, 0);
    assert.is(memo(), 0);
    assert.equal(capturedPrev, [undefined]);
    setTimeout(() => {
      setCount(1);
      setCount(2);
      assert.is(memo(), 0);
      setTimeout(() => {
        assert.is(memo(), 2);
        assert.equal(capturedPrev, [undefined, 0]);
        dispose();
      }, 0);
    }, 0);
  })
);

thr("changing initial value", () =>
  createRoot(dispose => {
    const capturedPrev: any[] = [];
    const memo = createThrottledMemo(
      prev => {
        capturedPrev.push(prev);
        return 123;
      },
      0,
      { value: 0 }
    );
    assert.is(memo(), 123);
    assert.equal(capturedPrev, [0]);
    dispose();
  })
);

thr("execution order is the same even when batched", () => {
  createRoot(dispose => {
    const order: number[] = [];
    createThrottledMemo(() => order.push(1), 0);
    createMemo(() => order.push(2));
    assert.equal(order, [1, 2]);
    dispose();
  });
  createRoot(dispose => {
    createEffect(() => {
      const order: number[] = [];
      createThrottledMemo(() => order.push(1), 0);
      createMemo(() => order.push(2));
      assert.equal(order, [1, 2]);
      dispose();
    });
  });
});

thr.run();

const deb = suite("createDebouncedMemo");

deb("writes to signal are debounced", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const memo = createDebouncedMemo(() => count(), 50);
    assert.is(memo(), 0);
    setTimeout(() => {
      assert.is(memo(), 0);
      setCount(1);
      setTimeout(() => {
        assert.is(memo(), 0);
        setCount(2);
        setTimeout(() => {
          assert.is(memo(), 0);
          setCount(3);
          setTimeout(() => {
            assert.is(memo(), 3);
            dispose();
          }, 200);
        }, 10);
      }, 10);
    }, 10);
  })
);

deb("execution order is the same even when batched", () => {
  createRoot(dispose => {
    const order: number[] = [];
    createDebouncedMemo(() => order.push(1), 0);
    createMemo(() => order.push(2));
    assert.equal(order, [1, 2]);
    dispose();
  });
  createRoot(dispose => {
    createEffect(() => {
      const order: number[] = [];
      createDebouncedMemo(() => order.push(1), 0);
      createMemo(() => order.push(2));
      assert.equal(order, [1, 2]);
      dispose();
    });
  });
});

deb.run();
