import { createAsyncMemo } from "../src";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createAsyncMemo");

test("resolves synchronous functions", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const memo = createAsyncMemo(count);
    assert.is(count(), memo());
    setCount(1);
    assert.is(count(), memo());
    dispose();
  }));

test("resolves asynchronous functions", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const memo = createAsyncMemo(
      () =>
        new Promise(res => {
          const n = count();
          setTimeout(() => res(n), 0);
        })
    );
    assert.is(memo(), undefined);
    setCount(1);
    assert.is(memo(), undefined);
    setTimeout(() => {
      assert.is(count(), memo());
      dispose();
    }, 0);
  }));

test("preserves order of execution", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    let first = true;
    const memo = createAsyncMemo(
      () =>
        new Promise(res => {
          const n = count();
          if (first) {
            first = false;
            setTimeout(() => res(n), 100);
          } else {
            setTimeout(() => res(n), 0);
          }
        })
    );
    setCount(1);
    setTimeout(() => {
      assert.is(memo(), 1);
      dispose();
    }, 100);
  }));

test.run();
