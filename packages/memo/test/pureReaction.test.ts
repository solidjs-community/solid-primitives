import { describe, test, expect } from "vitest";
import { createPureReaction } from "../src/index.js";
import { createMemo, createRoot, createSignal, flush } from "solid-js";

describe("createPureReaction", () => {
  test("tracking works", () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;
    let track!: (fn: () => void) => void;

    const dispose = createRoot(d => {
      track = createPureReaction(() => runCount++);
      return d;
    });

    expect(runCount, "onInvalidate shouldn't run before tracking").toBe(0);
    track(() => count());
    expect(runCount, "shouldn't run before setting value").toBe(0);
    setCount(1);
    flush();
    expect(runCount, "should run after tracked signal has been changed").toBe(1);
    setCount(3);
    flush();
    expect(runCount, "next change should be ignored").toBe(1);
    track(() => count());
    expect(runCount, "track itself shouldn't trigger callback").toBe(1);
    setCount(2);
    flush();
    expect(runCount).toBe(2);
    setCount(4);
    flush();
    expect(runCount, "next change should be ignored").toBe(2);

    dispose();
  });

  test("tracking multiple sources", () => {
    const [count, setCount] = createSignal(0);
    const [count2, setCount2] = createSignal(0);
    let runCount = 0;
    let track!: (fn: () => void) => void;

    const dispose = createRoot(d => {
      track = createPureReaction(() => runCount++);
      return d;
    });

    track(() => [count(), count2()]);
    expect(runCount, "no changes yet").toBe(0);

    setCount2(1);
    flush();
    expect(runCount, "reaction triggered").toBe(1);

    setCount(1);
    flush();
    expect(runCount, "count is not tracked anymore").toBe(1);

    dispose();
  });

  test("tracking single source multiple times", () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;
    let track!: (fn: () => void) => void;

    const dispose = createRoot(d => {
      track = createPureReaction(() => runCount++);
      return d;
    });

    track(count);
    track(count);
    expect(runCount, "no changes yet").toBe(0);

    setCount(1);
    flush();
    expect(runCount, "reaction triggered").toBe(1);

    setCount(2);
    flush();
    expect(runCount, "count is not tracked anymore").toBe(1);

    dispose();
  });

  test("inInvalidate callback doesn't track by default", () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;
    let track!: (fn: () => void) => void;

    const dispose = createRoot(d => {
      track = createPureReaction(() => {
        count();
        runCount++;
      });
      return d;
    });

    setCount(1);
    flush();
    expect(runCount, "no changes yet").toBe(0);

    setCount(2);
    flush();
    expect(runCount, "still none").toBe(0);

    track(count);
    setCount(3);
    flush();
    expect(runCount, "ran once").toBe(1);

    setCount(4);
    flush();
    expect(runCount, "still ran only once").toBe(1);

    dispose();
  });

  test("dispose stops tracking", () => {
    const [count, setCount] = createSignal(0);
    let runCount = 0;
    let track!: (fn: () => void) => void;

    const dispose = createRoot(d => {
      track = createPureReaction(() => runCount++);
      return d;
    });

    track(count);
    dispose();
    setCount(1);
    flush();
    expect(runCount, "no tracking after disposal").toBe(0);

    track(count);
    setCount(2);
    flush();
    expect(runCount, "2. no tracking after disposal").toBe(0);
  });

  test("executes tracked functions synchronously", () =>
    createRoot(dispose => {
      const order: number[] = [];

      const track = createPureReaction(() => {});
      order.push(1);
      track(() => order.push(2));
      order.push(3);
      createMemo(() => order.push(4));

      expect(order).toEqual([1, 2, 3, 4]);
      dispose();
    }));
});
