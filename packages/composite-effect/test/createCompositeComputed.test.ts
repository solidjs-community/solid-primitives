import { createMemo } from "solid-js";
import { createRoot, createSignal } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { promiseTimeout } from "../src/common";

import { createCompositeComputed } from "../src/createCompositeComputed";
import { AsyncTest } from "./async-test";

test("initial effect", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const watchCounter = [];

    createCompositeComputed(counter, n => watchCounter.push(n));
    assert.equal(watchCounter, [0], "initial state is captured immediately");

    setCounter(9);
    assert.equal(watchCounter, [0, 9], "assign in the same effect should be captured immediately");
  });
});

test("defer", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const watchCounter = [];

    createCompositeComputed(counter, n => watchCounter.push(n), { defer: true });

    // since createComputed don't batch changes in effects, this will be captured:
    setCounter(9);

    setTimeout(() => {
      assert.equal(watchCounter, [9], "defering should ignore initial state, but not the change");
      dispose();
    }, 0);
  });
});

test("watching signal", async () => {
  const dispose = createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const watchCounter = [];

    createCompositeComputed(counter, n => watchCounter.push(n));

    // some function call in the future
    setTimeout(() => {
      setCounter(1);
      assert.is(watchCounter[1], 1, "assign in function call");
    }, 0);

    // another function call in the future
    // here each change is captured individually
    setTimeout(() => {
      setCounter(5);
      assert.is(watchCounter[2], 5, "assign series in function call - 1");
      setCounter(7);
      assert.is(watchCounter[3], 7, "assign series in function call - 2");
    }, 0);

    return dispose;
  });
  await promiseTimeout(500).finally(dispose);
});

test("watching array of signals", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);
    const [text, setText] = createSignal("");

    const captured: [number, string][] = [];

    createCompositeComputed([counter, text], x => captured.push(x));

    setTimeout(() => {
      setCounter(1);
      assert.equal(captured[1], [1, ""], "first assign - number");
      setText("hello");
      assert.equal(captured[2], [1, "hello"], "second assign - text");
      dispose();
    }, 0);
  });
});

test("watching memo", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);
    const aboveFive = createMemo(() => counter() > 5);

    const captured: boolean[] = [];

    createCompositeComputed(aboveFive, x => captured.push(x), { defer: true });

    setTimeout(() => {
      setCounter(1);
      assert.is(captured.length, 0, "first");
      setCounter(2);
      assert.is(captured.length, 0, "second");
      setCounter(6);
      assert.is(captured[0], true, "third");
      setCounter(7);
      assert.is(captured.length, 1, "fourth");
      resolve();
    }, 0);
  }));

test("dispose onCleanup", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const dispose = createRoot(dispose => {
      createCompositeComputed(counter, x => captured.push(x));
      return dispose;
    });

    setTimeout(() => {
      assert.is(captured[0], 0, "onCleanup: initial value");
      setCounter(1);
      assert.is(captured[1], 1, "add before cleanup");
      dispose();
      setCounter(2);
      assert.is(captured[2], undefined, "change after cleanup");
      resolve();
    }, 0);
  }));

test.run();
