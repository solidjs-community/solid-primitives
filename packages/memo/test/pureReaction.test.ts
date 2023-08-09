import { describe, test, expect } from "vitest";
import { createPureReaction } from "../src/index.js";
import { createEffect, createMemo, createRoot, createSignal } from "solid-js";

describe("createPureReaction", () => {
  test("tracking works", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);

      let runCount = 0;
      const track = createPureReaction(() => runCount++);

      expect(runCount, "onInvalidate shouldn't run before tracking").toBe(0);
      track(() => count());
      expect(runCount, "shouldn't run before setting value").toBe(0);
      setCount(1);
      expect(runCount, "should run after tracked signal has been changed").toBe(1);
      setCount(3);
      expect(runCount, "next change should be ignored").toBe(1);
      track(() => count());
      expect(runCount, "track itself shouldn't trigger callback").toBe(1);
      setCount(2);
      expect(runCount).toBe(2);
      setCount(4);
      expect(runCount, "next change should be ignored").toBe(2);

      dispose();
    }));

  test("tracking multiple sources", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const [count2, setCount2] = createSignal(0);

      let runCount = 0;
      const track = createPureReaction(() => runCount++);

      track(() => [count(), count2()]);
      expect(runCount, "no changes yet").toBe(0);

      setCount2(1);
      expect(runCount, "reaction triggered").toBe(1);

      setCount(1);
      expect(runCount, "count is not tracked anymore").toBe(1);

      dispose();
    }));

  test("tracking single source multiple times", () =>
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);

      let runCount = 0;
      const track = createPureReaction(() => runCount++);

      track(count);
      track(count);
      expect(runCount, "no changes yet").toBe(0);

      setCount(1);
      expect(runCount, "reaction triggered").toBe(1);

      setCount(2);
      expect(runCount, "count is not tracked anymore").toBe(1);

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
      expect(runCount, "no changes yet").toBe(0);

      setCount(2);
      expect(runCount, "sstill none").toBe(0);

      track(count);
      setCount(3);
      expect(runCount, "ran once").toBe(1);

      setCount(4);
      expect(runCount, "still ran only once").toBe(1);

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
      expect(runCount, "no tracking after disposal").toBe(0);

      track(count);
      setCount(2);
      expect(runCount, "2. no tracking after disposal").toBe(0);
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

        expect(order).toEqual([1, 2, 3, 4]);
        dispose();
      });
    }));
});
