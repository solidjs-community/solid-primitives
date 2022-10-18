import { createMemo } from "solid-js";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { promiseTimeout } from "../src/common";

import { createCompositeEffect } from "../src/createCompositeEffect";

describe("createCompositeEffect", () => {
  it("initial effect", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const watchCounter: number[] = [];

      createCompositeEffect(counter, n => watchCounter.push(n));

      // all changes in the same effect will be batched
      setCounter(9);

      expect(watchCounter.length).toBe(0);

      setTimeout(() => {
        expect(watchCounter[0]).toBe(9);
        dispose();
      }, 0);
    });
  });

  it("defer", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const watchCounter: number[] = [];

      createCompositeEffect(counter, n => watchCounter.push(n), { defer: true });

      // all changes in the same effect will be batched
      setCounter(9);

      setTimeout(() => {
        expect(watchCounter.length).toBe(0);
        dispose();
      }, 0);
    });
  });

  it("watching signal", async () => {
    const dispose = createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const watchCounter: number[] = [];

      createCompositeEffect(counter, n => watchCounter.push(n));

      // some function call in the future
      setTimeout(() => {
        setCounter(1);
        expect(watchCounter[1]).toBe(1);
      }, 0);

      // another function call in the future
      // here each change is captured individually
      setTimeout(() => {
        setCounter(5);
        setCounter(7);
        expect(watchCounter[2]).toBe(5);
        expect(watchCounter[3]).toBe(7);
      }, 0);

      return dispose;
    });
    await promiseTimeout(500).finally(dispose);
  });

  it("watching array of signals", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);
      const [text, setText] = createSignal("");

      const captured: [number, string][] = [];

      createCompositeEffect([counter, text], x => captured.push(x));

      setTimeout(() => {
        setCounter(1);
        expect(captured[1]).toEqual([1, ""]);
        setText("hello");
        expect(captured[2]).toEqual([1, "hello"]);
        dispose();
      }, 0);
    });
  });

  it("watching memo", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);
      const aboveFive = createMemo(() => counter() > 5);

      const captured: boolean[] = [];

      createCompositeEffect(aboveFive, x => captured.push(x), { defer: true });

      setTimeout(() => {
        setCounter(1);
        expect(captured.length).toBe(0);
        setCounter(2);
        expect(captured.length).toBe(0);
        setCounter(6);
        expect(captured[0]).toBe(true);
        setCounter(7);
        expect(captured.length).toBe(1);
        dispose();
      }, 0);
    });
  });

  it("dispose onCleanup", () => {
    createRoot(dispose1 => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      const dispose2 = createRoot(dispose2 => {
        createCompositeEffect(counter, x => captured.push(x));
        return dispose2;
      });

      setTimeout(() => {
        expect(captured[0]).toBe(0);
        setCounter(1);
        expect(captured[1]).toBe(1);
        dispose2();
        setCounter(2);
        expect(captured[2]).toBe(undefined);
        dispose1();
      }, 0);
    });
  });
});
