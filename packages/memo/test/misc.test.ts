import { createPureReaction } from "../src";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testPR = suite("createPureReaction");

testPR("tracking works", () =>
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
  })
);

// TODO: more createPureReaction tests

testPR.run();
