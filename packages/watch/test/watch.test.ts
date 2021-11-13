import { createEffect, createMemo } from "solid-js";
import { createRoot, createSignal } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { promiseTimeout } from "../src/common";

import { watch } from "../src/watch";

const AsyncTest = (fn: (resolve: Function, reject: Function) => void) => {
  const promises: Promise<void>[] = [];
  const dispose = createRoot(dispose => {
    promises.push(new Promise(fn));
    return dispose;
  });
  promises.push(promiseTimeout(500, true).finally(dispose));
  return Promise.race(promises);
};

test("watching signal", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);

    const watchCounter = [];

    watch(counter, n => watchCounter.push(n));

    // all changes in the same effect will be batched
    setCounter(9);
    assert.is.not(watchCounter[0], 9, "assign in the same effect");

    // some function call in the future
    setTimeout(() => {
      setCounter(1);
      assert.is(watchCounter[0], 1, "assign in function call");
    }, 0);

    // another function call in the future
    // here each change is captured individually
    setTimeout(() => {
      setCounter(5);
      setCounter(7);
      assert.is(watchCounter[1], 5, "assign series in function call - 1");
      assert.is(watchCounter[2], 7, "assign series in function call - 2");
      resolve();
    }, 0);
  }));

test("watching array of signals", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);
    const [text, setText] = createSignal("");

    const captured: [number, string][] = [];

    watch([counter, text], x => captured.push(x));

    setTimeout(() => {
      setCounter(1);
      assert.equal(captured[0], [1, ""], "first assign - number");
      setText("hello");
      assert.equal(captured[1], [1, "hello"], "second assign - text");
      resolve();
    }, 0);
  }));

test("watching memo", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);
    const aboveFive = createMemo(() => counter() > 5);

    const captured: boolean[] = [];

    watch(aboveFive, x => captured.push(x));

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

test("stop watch function", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const stop = watch(counter, x => captured.push(x));

    setTimeout(() => {
      setCounter(1);
      assert.is(captured[0], 1, "change before stop");
      stop();
      setCounter(2);
      assert.is(captured[1], undefined, "change after stop");
      resolve();
    }, 0);
  }));

test("dispose onCleanup", async () =>
  AsyncTest(resolve => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const dispose = createRoot(dispose => {
      watch(counter, x => captured.push(x));
      return dispose;
    });

    setTimeout(() => {
      setCounter(1);
      assert.is(captured[0], 1, "add before cleanup");
      dispose();
      setCounter(2);
      assert.is(captured[1], undefined, "change after cleanup");
      resolve();
    }, 0);
  }));

test.run();
