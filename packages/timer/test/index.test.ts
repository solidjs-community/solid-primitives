import { createTimer, createPolled } from "../src/index";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createSignal } from "solid-js";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms + 5));
}

const test = suite("timer");

test("createTimer with setTimeout calls callback as expected with number delay", async () => {
  await createRoot(async dispose => {
    let count = 0;
    createTimer(() => count++, 100);
    assert.equal(count, 0);
    for (let i = 1; i < 5; i++) {
      await sleep(100);
      assert.equal(count, 1);
    }
    dispose();
  });
});

test("createTimer with setInterval calls callback as expected with number delay", async () => {
  await createRoot(async dispose => {
    let count = 0;
    createTimer(() => count++, 100, setInterval);
    assert.equal(count, 0);
    for (let i = 1; i < 5; i++) {
      await sleep(100);
      assert.equal(count, i);
    }
    dispose();
  });
});

test("createTimer with setTimeout calls callback as expected with accessor delay", async () => {
  await createRoot(async dispose => {
    let count = 0;
    const [enabled, setEnabled] = createSignal(true);
    const [delay, setDelay] = createSignal(50);
    createTimer(
      () => count++,
      () => enabled() && delay()
    );
    assert.equal(count, 0);
    for (let i = 1; i < 3; i++) {
      await sleep(delay());
      assert.equal(count, 1);
    }
    setDelay(100);
    for (let i = 3; i < 5; i++) {
      await sleep(delay());
      assert.equal(count, 2);
    }
    setEnabled(false);
    for (let i = 0; i < 5; i++) {
      await sleep(delay());
      assert.equal(count, 2);
    }
    dispose();
  });
});

test("createTimer with setInterval calls callback as expected with accessor delay", async () => {
  await createRoot(async dispose => {
    let count = 0;
    const [enabled, setEnabled] = createSignal(true);
    const [delay, setDelay] = createSignal(50);
    createTimer(
      () => count++,
      () => enabled() && delay(),
      setInterval
    );
    assert.equal(count, 0);
    for (let i = 1; i < 3; i++) {
      await sleep(delay());
      assert.equal(count, i);
    }
    setDelay(100);
    for (let i = 3; i < 5; i++) {
      await sleep(delay());
      assert.equal(count, i);
    }
    setEnabled(false);
    for (let i = 0; i < 5; i++) {
      await sleep(delay());
      assert.equal(count, 4);
    }
    dispose();
  });
});

test("createPolled with setTimeout calls callback as expected with number delay", async () => {
  await createRoot(async dispose => {
    const count = createPolled(prev => prev + 1, 100, 0, setTimeout);
    assert.equal(count(), 0);
    for (let i = 1; i < 5; i++) {
      await sleep(100);
      assert.equal(count(), 1);
    }
    dispose();
  });
});

test("createPolled with setInterval calls callback as expected with number delay", async () => {
  await createRoot(async dispose => {
    const count = createPolled(prev => prev + 1, 100, 0);
    assert.equal(count(), 0);
    for (let i = 1; i < 5; i++) {
      await sleep(100);
      assert.equal(count(), i);
    }
    dispose();
  });
});

test("createPolled with setTimeout calls callback as expected with accessor delay", async () => {
  await createRoot(async dispose => {
    const [enabled, setEnabled] = createSignal(true);
    const [delay, setDelay] = createSignal(50);
    const count = createPolled(
      prev => prev + 1,
      () => enabled() && delay(),
      0,
      setTimeout
    );
    assert.equal(count(), 0);
    for (let i = 1; i < 3; i++) {
      await sleep(delay());
      assert.equal(count(), 1);
    }
    setDelay(100);
    for (let i = 3; i < 5; i++) {
      await sleep(delay());
      assert.equal(count(), 2);
    }
    setEnabled(false);
    for (let i = 0; i < 5; i++) {
      await sleep(delay());
      assert.equal(count(), 2);
    }
    dispose();
  });
});

test("createPolled with setInterval calls callback as expected with accessor delay", async () => {
  await createRoot(async dispose => {
    const [enabled, setEnabled] = createSignal(true);
    const [delay, setDelay] = createSignal(50);
    const count = createPolled(
      prev => prev + 1,
      () => enabled() && delay(),
      0
    );
    assert.equal(count(), 0);
    for (let i = 1; i < 3; i++) {
      await sleep(delay());
      assert.equal(count(), i);
    }
    setDelay(100);
    for (let i = 3; i < 5; i++) {
      await sleep(delay());
      assert.equal(count(), i);
    }
    setEnabled(false);
    for (let i = 0; i < 5; i++) {
      await sleep(delay());
      assert.equal(count(), 4);
    }
    dispose();
  });
});

test.run();
