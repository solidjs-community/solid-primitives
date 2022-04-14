import { createTimer, createPolled } from "../src/index";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot } from "solid-js";

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

test.run();
