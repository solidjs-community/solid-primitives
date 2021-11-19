import { createRoot, createSignal, createMemo } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";

import { createCompositeEffect } from "../src/createCompositeEffect";
import {
  atMost,
  debounce,
  ignorable,
  once,
  pausable,
  stoppable,
  throttle,
  whenever
} from "../src/modifiers";

test("stoppable", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const { stop } = createCompositeEffect(stoppable(counter, x => captured.push(x)));

    setTimeout(() => {
      setCounter(1);
      assert.is(captured[1], 1, "change before stop");
      stop();
      setCounter(2);
      assert.is(captured[2], undefined, "change after stop");
      dispose();
    }, 0);
  });
});

test("once", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    createCompositeEffect(
      once(counter, x => captured.push(x)),
      { defer: true }
    );

    setTimeout(() => {
      setCounter(1);
      assert.is(captured[0], 1, "first change should be captured");
      setCounter(2);
      assert.is(captured[1], undefined, "next change shouldn't be captured");
      dispose();
    }, 0);
  });
});

test("atMost", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const { count } = createCompositeEffect(atMost(counter, x => captured.push(x), { limit: 2 }));
    assert.is(count(), 0, "initial count should be 0");

    setTimeout(() => {
      assert.is(count(), 1, "count after initial effect should be 1");
      assert.equal(captured, [0], "initial state should be captured");
      setCounter(1);
      assert.is(count(), 2, "count after first change should be 2");
      assert.equal(captured, [0, 1], "first change should be captured");
      setCounter(2);
      assert.is(count(), 2, "count next change should still be 2");
      assert.equal(captured, [0, 1], "next change shouldn't be captured");
      dispose();
    }, 0);
  });
});

test("debounce", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    createCompositeEffect(debounce(counter, x => captured.push(x), 10));

    setTimeout(() => {
      assert.equal(captured, [], "initial state should not be captured immediately");
      setCounter(1);
      assert.equal(captured, [], "first change should not be captured immediately");
    }, 0);

    setTimeout(() => {
      assert.equal(captured, [1], "after delay, only the last change should be captured");
      setCounter(7);
      setCounter(9);
      setTimeout(() => {
        assert.equal(captured, [1, 9], "after delay, only the next last change should be captured");
        dispose();
      }, 15);
    }, 15);
  });
});

test("throttle", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    createCompositeEffect(throttle(counter, x => captured.push(x), 10));

    setTimeout(() => {
      assert.equal(captured, [], "initial state should not be captured immediately");
      setCounter(1);
      assert.equal(captured, [], "first change should not be captured immediately");
    }, 0);

    setTimeout(() => {
      assert.equal(captured, [0], "after delay, only the initial state should be captured");
      setCounter(7);
      setCounter(9);
      setTimeout(() => {
        assert.equal(
          captured,
          [0, 7],
          "after delay, only the next first change should be captured"
        );
        dispose();
      }, 15);
    }, 15);
  });
});

test("whenever", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured1: number[] = [];
    const captured2: number[] = [];

    createCompositeEffect(
      whenever(
        () => counter() % 2 === 0,
        () => captured1.push(counter())
      )
    );

    createCompositeEffect(
      whenever(
        createMemo(() => counter() >= 3),
        () => captured2.push(counter())
      )
    );

    setTimeout(() => {
      assert.equal(captured1, [0], "initial state should be captured for 1");
      assert.equal(captured2, [], "initial state should not be captured for 2");
      setCounter(1);
      assert.equal(captured1, [0], "first change should not be captured for 1");
      assert.equal(captured2, [], "first change should not be captured for 2");
      setCounter(2);
      assert.equal(captured1, [0, 2], "2 should be added for 1");
      assert.equal(captured2, [], "2 should not be added for 2");
      setCounter(3);
      assert.equal(captured1, [0, 2], "3 should not be added for 1");
      assert.equal(captured2, [3], "3 should be added for 2");
      setCounter(4);
      assert.equal(captured1, [0, 2, 4], "4 should be added for 1");
      assert.equal(captured2, [3], "4 should not be added for 2");
    }, 0);
  });
});

test("pausable", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const { pause, resume, toggle } = createCompositeEffect(
      pausable(counter, () => captured.push(counter()), { active: false })
    );

    setTimeout(() => {
      assert.equal(captured, [], "initial state should not be captured");
      setCounter(1);
      assert.equal(captured, [], "first change should not be captured");
      resume();
      setCounter(2);
      assert.equal(captured, [2], "after resume() change should be captured");
      pause();
      setCounter(3);
      assert.equal(captured, [2], "after pause() change should not be captured");
      toggle();
      setCounter(4);
      assert.equal(captured, [2, 4], "after toggle() change should be captured");
      toggle(true);
      setCounter(5);
      assert.equal(captured, [2, 4, 5], "after toggle(true) change should be captured");
      toggle(false);
      setCounter(6);
      assert.equal(captured, [2, 4, 5], "after toggle(false) change should not be captured");
      dispose();
    }, 0);
  });
});

test("ignorable", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captured: number[] = [];

    const { ignoreNext, ignore } = createCompositeEffect(
      ignorable(counter, x => {
        captured.push(x);
        // next effect will be ignored:
        ignoreNext();
        setCounter(p => p + 1);

        // this change happens in the same effect, so it will also be ignored
        setCounter(5);
      })
    );

    setTimeout(() => {
      assert.equal(captured, [0], "initial state should be captured");
      assert.is(counter(), 5, "although it wasn't captured, the counter should be 5");
      ignore(() => {
        // both changes will be ignored:
        setCounter(420);
        setCounter(69);
      });
      assert.equal(captured, [0], "changes in ignore() should not be captured");
      assert.equal(counter(), 69, "changes in ignore() were executed applied");
      // but not this one:
      setCounter(p => 111);
      assert.equal(captured, [0, 111], "changes after ignore() should be captured");
      dispose();
    }, 0);
  });
});

test.run();
