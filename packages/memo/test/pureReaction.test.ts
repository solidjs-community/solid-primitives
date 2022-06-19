import { createPureReaction } from "../src";
import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createPureReaction");

test("tracking works", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);

    let runCount = 0;
    const track = createPureReaction(() => runCount++);

    assert.is(runCount, 0, "onInvalidate shouldn't run before tracking");
    track(() => count());
    assert.is(runCount, 0, "shouldn't run before setting value");
    setCount(1);
    assert.is(runCount, 1, "should run after tracked signal has been changed");
    setCount(3);
    assert.is(runCount, 1, "next change should be ignored");
    track(() => count());
    assert.is(runCount, 1, "track itself shouldn't trigger callback");
    setCount(2);
    assert.is(runCount, 2);
    setCount(4);
    assert.is(runCount, 2, "next change should be ignored");

    dispose();
  }));

test("tracking multiple sources", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);
    const [count2, setCount2] = createSignal(0);

    let runCount = 0;
    const track = createPureReaction(() => runCount++);

    track(() => [count(), count2()]);
    assert.is(runCount, 0, "no changes yet");

    setCount2(1);
    assert.is(runCount, 1, "reaction triggered");

    setCount(1);
    assert.is(runCount, 1, "count is not tracked anymore");

    dispose();
  }));

test("tracking single source multiple times", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);

    let runCount = 0;
    const track = createPureReaction(() => runCount++);

    track(count);
    track(count);
    assert.is(runCount, 0, "no changes yet");

    setCount(1);
    assert.is(runCount, 1, "reaction triggered");

    setCount(2);
    assert.is(runCount, 1, "count is not tracked anymore");

    dispose();
  }));

test("inInvalidate callback doesn't track by default", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);

    let runCount = 0;
    const track = createPureReaction(() => {
      count();
      runCount++;
    });

    setCount(1);
    assert.is(runCount, 0, "no changes yet");

    setCount(2);
    assert.is(runCount, 0, "sstill none");

    track(count);
    setCount(3);
    assert.is(runCount, 1, "ran once");

    setCount(4);
    assert.is(runCount, 1, "still ran only once");

    dispose();
  }));

test("dispose stops tracking", () =>
  createRoot(dispose => {
    const [count, setCount] = createSignal(0);

    let runCount = 0;
    const track = createPureReaction(() => runCount++);

    track(count);
    dispose();
    setCount(1);
    assert.is(runCount, 0, "no tracking after disposal");

    track(count);
    setCount(2);
    assert.is(runCount, 0, "2. no tracking after disposal");
  }));

test("executes tracked functions synchronously even in batched effects", () =>
  createRoot(dispose => {
    createEffect(() => {
      const order: number[] = [];

      const track = createPureReaction(() => {});
      order.push(1);
      track(() => order.push(2));
      order.push(3);
      createMemo(() => order.push(4));

      assert.equal(order, [1, 2, 3, 4]);
      dispose();
    });
  }));

test.run();
