import { createCallback, createBranch, createDisposable } from "../src";
import { createComputed, createRoot, createSignal, getOwner } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const csr = suite("createBranch");

csr("behaves like a root", () =>
  createBranch(dispose => {
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
    createBranch(() => {
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

  createBranch(
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

const ccwo = suite("createCallback");

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

const risr = suite("createDisposable");

risr("working with createComputed", () => {
  const [count, setCount] = createSignal(0);
  const captured: any[] = [];
  const dispose = createDisposable(() => createComputed(() => captured.push(count())));
  assert.equal(captured, [0]);
  setCount(1);
  assert.equal(captured, [0, 1], "before dispose()");
  dispose();
  assert.equal(captured, [0, 1], "after disposing");
});

risr("disposes together with owner", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const captured: any[] = [];
    createDisposable(() => createComputed(() => captured.push(count())));
    assert.equal(captured, [0]);
    setCount(1);
    assert.equal(captured, [0, 1], "before dispose()");
    dispose();
    assert.equal(captured, [0, 1], "after disposing");
  })
);

risr.run();
