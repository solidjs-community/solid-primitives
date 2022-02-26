import { createWritableMemo } from "../src";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createWritableMemo");

test("behaves like a memo", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(1);
    const [result] = createWritableMemo(() => count() * 2);
    assert.is(result(), count() * 2);
    setCount(5);
    assert.is(result(), count() * 2);
    dispose();
  }));

test("value can be overwritten", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(1);
    const [result, setResult] = createWritableMemo(() => count() * 2);
    assert.is(result(), count() * 2);
    setResult(5);
    assert.is(result(), 5);
    setCount(5);
    assert.is(result(), count() * 2);
    setCount(7);
    setResult(3);
    assert.is(result(), 3);
    dispose();
  }));

test.run();
