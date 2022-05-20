import { createMemoCache } from "../src";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createMemoCache");

test("cashes values by key", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);

    let runs = 0;
    const result = createMemoCache(count, n => {
      runs++;
      return n;
    });

    assert.is(runs, 0);
    assert.is(result(), 0);
    assert.is(runs, 1);

    setCount(1);
    assert.is(runs, 1);
    assert.is(result(), 1);
    assert.is(runs, 2);

    setCount(0);
    assert.is(runs, 2);
    assert.is(result(), 0);
    assert.is(runs, 2);

    setCount(1);
    assert.is(runs, 2);
    assert.is(result(), 1);
    assert.is(runs, 2);

    dispose();
  }));

test("passing key to access function", () =>
  createRoot(dispose => {
    let runs = 0;
    const result = createMemoCache((n: number) => {
      runs++;
      return n;
    });

    assert.is(runs, 0);
    assert.is(result(0), 0);
    assert.is(runs, 1);

    assert.is(result(1), 1);
    assert.is(runs, 2);

    assert.is(result(0), 0);
    assert.is(runs, 2);

    assert.is(result(1), 1);
    assert.is(runs, 2);

    dispose();
  }));

test("reactive signal dependency", () =>
  createRoot(dispose => {
    const [dep, setDep] = createSignal(0);

    let runs = 0;
    const result = createMemoCache((n: number) => {
      runs++;
      return n + dep();
    });

    assert.is(runs, 0);
    assert.is(result(0), 0);
    assert.is(runs, 1);

    assert.is(result(1), 1);
    assert.is(runs, 2);

    assert.is(result(0), 0);
    assert.is(runs, 2);

    assert.is(result(1), 1);
    assert.is(runs, 2);

    setDep(1);
    assert.is(runs, 2);
    assert.is(result(0), 1);
    assert.is(result(1), 2);
    assert.is(runs, 4);

    dispose();
  }));

test("limit cache size", () =>
  createRoot(dispose => {
    let runs = 0;
    const result = createMemoCache(
      (n: number) => {
        runs++;
        return n;
      },
      { size: 1 }
    );

    assert.is(runs, 0);
    assert.is(result(0), 0);
    assert.is(runs, 1);

    assert.is(result(1), 1);
    assert.is(runs, 2);

    assert.is(result(0), 0);
    assert.is(runs, 2);

    assert.is(result(1), 1);
    assert.is(runs, 3);

    dispose();
  }));

test.run();
