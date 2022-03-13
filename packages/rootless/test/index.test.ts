import {
  createCallback,
  createSharedRoot,
  createSubRoot,
  runWithRoot,
  runWithSubRoot
} from "../src";
import {
  createComputed,
  createMemo,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
  createEffect
} from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const csr = suite("createSubRoot");

csr("behaves like a root", () =>
  createSubRoot(dispose => {
    const captured: any[] = [];
    const [count, setCount] = createSignal(0);
    createComputed(() => captured.push(count()));
    setCount(1);
    assert.equal(captured, [0, 1], "before dispose()");
    dispose();
    setCount(2);
    assert.equal(captured, [0, 1], "after dispose()");
  })
);

csr("disposes with owner", () =>
  createRoot(dispose => {
    createSubRoot(() => {
      const captured: any[] = [];
      const [count, setCount] = createSignal(0);
      createComputed(() => captured.push(count()));
      setCount(1);
      assert.equal(captured, [0, 1], "before dispose()");
      dispose();
      setCount(2);
      assert.equal(captured, [0, 1], "after dispose()");
    });
  })
);

csr("many parent owners", () => {
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
      assert.equal(captured, [0, 1], "before dispose()");
      dispose1();
      setCount(2);
      assert.equal(captured, [0, 1], "after dispose()");
    },
    o1,
    o2
  );
  dispose2();
});

csr.run();

const ccwo = suite("createCallbackWithOwner");

ccwo("owner is available in async trigger", () =>
  createRoot(dispose => {
    let capturedPayload: any;
    let capturedOwner: any;
    const handler = createCallback(payload => {
      capturedPayload = payload;
      capturedOwner = getOwner();
    });

    setTimeout(() => {
      handler(123);
      assert.is(capturedPayload, 123);
      assert.is.not(capturedOwner, null);
      dispose();
    }, 0);
  })
);

ccwo.run();

const rir = suite("runWithRoot");

rir("working with createComputed", () => {
  const [count, setCount] = createSignal(0);
  const captured: any[] = [];
  const dispose = runWithRoot(() => createComputed(() => captured.push(count())));
  assert.equal(captured, [0]);
  setCount(1);
  assert.equal(captured, [0, 1], "before dispose()");
  dispose();
  assert.equal(captured, [0, 1], "after disposing");
});

rir("working with createMemo", () => {
  const [count, setCount] = createSignal(0);
  const [memo, dispose] = runWithRoot(() => createMemo(() => count()));
  assert.is(memo(), 0);
  setCount(1);
  assert.is(memo(), 1, "before dispose()");
  dispose();
  assert.is(memo(), 1, "after disposing");
});

rir.run();

const risr = suite("runWithSubRoot");

risr("working with createComputed", () => {
  const [count, setCount] = createSignal(0);
  const captured: any[] = [];
  const dispose = runWithSubRoot(() => createComputed(() => captured.push(count())));
  assert.equal(captured, [0]);
  setCount(1);
  assert.equal(captured, [0, 1], "before dispose()");
  dispose();
  assert.equal(captured, [0, 1], "after disposing");
});

risr("working with createMemo", () => {
  const [count, setCount] = createSignal(0);
  const [memo, dispose] = runWithSubRoot(() => createMemo(() => count()));
  assert.is(memo(), 0);
  setCount(1);
  assert.is(memo(), 1, "before dispose()");
  dispose();
  assert.is(memo(), 1, "after disposing");
});

risr("disposes together with owner", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const captured: any[] = [];
    runWithSubRoot(() => createComputed(() => captured.push(count())));
    assert.equal(captured, [0]);
    setCount(1);
    assert.equal(captured, [0, 1], "before dispose()");
    dispose();
    assert.equal(captured, [0, 1], "after disposing");
  })
);

risr.run();

const testSR = suite("createSharedRoot");

testSR("single root", () => {
  const [count, setCount] = createSignal(0);

  let runs = 0;
  let disposes = 0;
  const useMemo = createSharedRoot(() => {
    onCleanup(() => disposes++);
    return createMemo(() => {
      runs++;
      return count();
    });
  });

  createRoot(dispose => {
    assert.is(useMemo()(), 0);
    assert.is(disposes, 0);
    assert.is(runs, 1);
    setCount(1);
    assert.is(runs, 2);
    dispose();
    queueMicrotask(() => {
      assert.is(disposes, 1);
      assert.is(runs, 2);
      setCount(2);
      assert.is(runs, 2);
    });
  });
});

testSR("multiple roots", () => {
  const [count, setCount] = createSignal(0);

  let runs = 0;
  let disposes = 0;
  const useMemo = createSharedRoot(() => {
    onCleanup(() => disposes++);
    return createMemo(() => {
      runs++;
      return count();
    });
  });

  const d1 = createRoot(dispose => {
    assert.is(useMemo()(), 0);
    return dispose;
  });

  const d2 = createRoot(dispose => {
    createEffect(() => useMemo()());
    return dispose;
  });

  assert.is(runs, 1);
  setCount(1);
  assert.is(runs, 2);

  d1();

  queueMicrotask(() => {
    assert.is(runs, 2);
    assert.is(disposes, 0);
    setCount(2);
    assert.is(runs, 3);

    setTimeout(() => {
      d2();

      setTimeout(() => {
        assert.is(runs, 3);
        assert.is(disposes, 1);
        setCount(3);
        assert.is(runs, 3);
      });
    });
  });
});

testSR.run();
