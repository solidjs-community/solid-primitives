import { createLazyMemo } from "../src";
import { createComputed, createEffect, createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createLazyMemo");

test("won't run if not accessed", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    createLazyMemo(() => {
      runs++;
      return count();
    });
    setCount(1);
    assert.is(runs, 0, "0 in setup");

    setTimeout(() => {
      assert.is(runs, 0, "0 after timeout");
      setCount(2);
      assert.is(runs, 0, "0 after set in timeout");
      dispose();
    }, 0);
  }));

test("runs after being accessed", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    const memo = createLazyMemo(() => {
      runs++;
      return count();
    });
    setCount(1);
    assert.is(runs, 0, "0 in setup");

    assert.is(memo(), 1, "memo matches the signal on the first access");
    assert.is(runs, 1, "ran once");
    dispose();
  }));

test("runs only once, even if accessed multiple times", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let runs = 0;
    const memo = createLazyMemo(() => {
      runs++;
      return count();
    });
    setCount(1);
    assert.is(runs, 0, "0 in setup");

    assert.is(memo(), 1, "memo matches the signal on the first access");
    assert.is(memo(), 1, "memo matches the signal on the second access");
    assert.is(memo(), 1, "memo matches the signal on the third access");
    assert.is(runs, 1, "ran once");
    dispose();
  }));

test("runs once until invalidated", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let runs = 0;

    const memo = createLazyMemo(() => {
      runs++;
      return count();
    });

    createComputed(memo);
    assert.is(runs, 1, "1-1.");
    createComputed(memo);
    assert.is(runs, 1, "1-2.");
    memo();
    assert.is(runs, 1, "1-3.");

    setCount(1);
    assert.is(runs, 2, "2-1.");

    createComputed(memo);
    assert.is(runs, 2, "2-2.");

    dispose();
  }));

test("won't run if the root of where it was accessed is gone", () =>
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

    assert.is(runs, 1, "1");

    // lazy memo is disposed in the next microtask
    queueMicrotask(() => {
      setCount(1);
      assert.is(runs, 1, "2");
      dispose();
    });
  }));

test("will be running even if some of the reading roots are disposed", () =>
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

    assert.is(runs, 1, "ran once");

    setCount(1);

    assert.is(runs, 2, "ran twice");

    dispose1();
    setCount(2);
    assert.is(runs, 3, "ran 3 times");

    dispose2();

    // lazy memo is disposed in the next microtask
    queueMicrotask(() => {
      setCount(3);
      assert.is(runs, 3, "ran 3 times; (not changed)");
      dispose();
    });
  }));

test("initial value if NOT set in options", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let capturedPrev: any;
    const memo = createLazyMemo(prev => {
      capturedPrev = prev;
      return count();
    });
    const captured: any[] = [];

    createComputed(() => captured.push(memo()));
    assert.equal(captured, [0]);
    assert.equal(capturedPrev, undefined);

    setCount(1);
    assert.equal(captured, [0, 1]);
    assert.equal(capturedPrev, 0);

    dispose();
  }));

test("initial value if set", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let capturedPrev: any;
    const memo = createLazyMemo(prev => {
      capturedPrev = prev;
      return count();
    }, 123);
    const captured: any[] = [];

    createComputed(() => captured.push(memo()));
    assert.equal(captured, [0]);
    assert.equal(capturedPrev, 123);

    setCount(1);
    assert.equal(captured, [0, 1]);
    assert.equal(capturedPrev, 0);

    dispose();
  }));

test("handles prev value properly", () =>
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
    assert.is(capturedPrev, undefined);

    setCount(1);
    assert.is(capturedPrev, 0);

    dis1();

    // lazy memo is disposed in the next microtask
    queueMicrotask(() => {
      setCount(2);
      assert.is(capturedPrev, 0);
      assert.is(memo(), 2);
      assert.is(capturedPrev, 1);
      dispose();
    });
  }));

test("works in an effect", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const memo = createLazyMemo(count);
    const captured: number[] = [];
    createEffect(() => captured.push(memo()));

    queueMicrotask(() => {
      assert.equal(captured, [0]);

      setCount(1);
      queueMicrotask(() => {
        assert.equal(captured, [0, 1]);
        dispose();
      });
    });
  }));

test("computation will last until the source changes", () =>
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

    assert.is(runs, 1);

    createRoot(dispose => {
      createComputed(memo);
      dispose();
    });

    assert.is(runs, 1);

    setCount(1);

    assert.is(runs, 1);

    dispose();
  }));

test.run();
