import { createDebouncedMemo, createDebouncedMemoOn, createThrottledMemo } from "../src";
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
      0
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
    let runs = 0;
    const [count, setCount] = createSignal(0);
    const memo = createDebouncedMemo(() => {
      runs++;
      return count();
    }, 50);
    assert.is(memo(), 0);
    assert.is(runs, 1);
    setTimeout(() => {
      assert.is(memo(), 0);
      assert.is(runs, 1);
      setCount(1);
      setTimeout(() => {
        assert.is(memo(), 0);
        assert.is(runs, 2);
        setCount(2);
        setTimeout(() => {
          assert.is(memo(), 0);
          assert.is(runs, 3);
          setCount(3);
          setTimeout(() => {
            assert.is(memo(), 3);
            assert.is(runs, 4);
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

const don = suite("createDebouncedMemoOn");

don("callback is debounced", () =>
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
    assert.is(memo(), 0);
    assert.is(runs, 1);
    setTimeout(() => {
      assert.is(memo(), 0);
      assert.is(runs, 1);
      setCount(1);
      setTimeout(() => {
        assert.is(memo(), 0);
        assert.is(runs, 1);
        setCount(2);
        setTimeout(() => {
          assert.is(memo(), 0);
          assert.is(runs, 1);
          setCount(3);
          setTimeout(() => {
            assert.is(memo(), 3);
            assert.is(runs, 2);
            dispose();
          }, 200);
        }, 10);
      }, 10);
    }, 10);
  })
);

don("execution order is the same even when batched", () => {
  createRoot(dispose => {
    const order: number[] = [];
    createDebouncedMemoOn([], () => order.push(1), 0);
    createMemo(() => order.push(2));
    assert.equal(order, [1, 2]);
    dispose();
  });
  createRoot(dispose => {
    createEffect(() => {
      const order: number[] = [];
      createDebouncedMemoOn([], () => order.push(1), 0);
      createMemo(() => order.push(2));
      assert.equal(order, [1, 2]);
      dispose();
    });
  });
});

don.run();
