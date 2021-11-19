import { createRoot, createSignal } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";

import { createCompositeMemo, pausable } from "../src";

test("behaves like a normal memo", () => {
  createRoot(dispose => {
    const [count, setCount] = createSignal(2);

    const double = createCompositeMemo(count, x => x * 2);
    assert.is(double(), 4, "initial state should be applied immediately");

    setCount(7);
    assert.is(double(), 14, "change should be applied immediately");

    dispose();
  });
});

test("options are passed to createMemo", () => {
  createRoot(dispose => {
    const [count, setCount] = createSignal(2);

    const catchPrev = [];

    const double = createCompositeMemo(
      count,
      (a, b, c) => {
        catchPrev.push(c);
        return a * 2;
      },
      {
        value: 10
      }
    );
    assert.equal(catchPrev, [10], "previous value should match the 'value' in options");

    setCount(7);
    assert.equal(catchPrev, [10, 4], "previous value should match the previous memo");

    dispose();
  });
});

test("applying modifiers", () => {
  createRoot(dispose => {
    const [count, setCount] = createSignal(2);

    const [double, { resume, pause }] = createCompositeMemo(
      pausable(count, x => x * 2, { active: false })
    );
    assert.is(double(), undefined, "initial state should be undefined");

    setCount(7);
    assert.is(double(), undefined, "first change should be undefined");

    resume();
    assert.is(double(), undefined, "memo should be still undefined");
    setCount(10);
    assert.is(double(), 20, "change after resume() should be normally captured");

    pause();
    setCount(11);
    assert.is(double(), 20, "change after pause() should be the prevous memo");

    dispose();
  });
});

test.run();
