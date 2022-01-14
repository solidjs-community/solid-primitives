import { createCallbackWithOwner, createSubRoot, runInRoot, runInSubRoot } from "../src";
import { createComputed, createMemo, createRoot, createSignal, getOwner } from "solid-js";
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

csr.run();

const ccwo = suite("createCallbackWithOwner");

ccwo("owner is available in async trigger", () =>
  createRoot(dispose => {
    let capturedPayload: any;
    let capturedOwner: any;
    const handler = createCallbackWithOwner(payload => {
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

const rir = suite("runInRoot");

rir("working with createComputed", () => {
  const [count, setCount] = createSignal(0);
  const captured: any[] = [];
  const dispose = runInRoot(() => createComputed(() => captured.push(count())));
  assert.equal(captured, [0]);
  setCount(1);
  assert.equal(captured, [0, 1], "before dispose()");
  dispose();
  assert.equal(captured, [0, 1], "after disposing");
});

rir("working with createMemo", () => {
  const [count, setCount] = createSignal(0);
  const [memo, dispose] = runInRoot(() => createMemo(() => count()));
  assert.is(memo(), 0);
  setCount(1);
  assert.is(memo(), 1, "before dispose()");
  dispose();
  assert.is(memo(), 1, "after disposing");
});

rir.run();

const risr = suite("runInSubRoot");

risr("working with createComputed", () => {
  const [count, setCount] = createSignal(0);
  const captured: any[] = [];
  const dispose = runInSubRoot(() => createComputed(() => captured.push(count())));
  assert.equal(captured, [0]);
  setCount(1);
  assert.equal(captured, [0, 1], "before dispose()");
  dispose();
  assert.equal(captured, [0, 1], "after disposing");
});

risr("working with createMemo", () => {
  const [count, setCount] = createSignal(0);
  const [memo, dispose] = runInSubRoot(() => createMemo(() => count()));
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
    runInSubRoot(() => createComputed(() => captured.push(count())));
    assert.equal(captured, [0]);
    setCount(1);
    assert.equal(captured, [0, 1], "before dispose()");
    dispose();
    assert.equal(captured, [0, 1], "after disposing");
  })
);

risr.run();
