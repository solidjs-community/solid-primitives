import { createRoot, createSignal, createMemo } from "solid-js";
import { describe, expect, it } from "vitest";

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

describe("modifiers", () => {
  it("stoppable", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      const { stop } = createCompositeEffect(stoppable(counter, x => captured.push(x)));

      setTimeout(() => {
        setCounter(1);
        expect(captured[1]).toBe(Function);
        stop();
        setCounter(2);
        expect(captured[2]).toBe(Function);
        dispose();
      }, 0);
    });
  });

  it("once", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      createCompositeEffect(
        once(counter, x => captured.push(x)),
        { defer: true }
      );

      setTimeout(() => {
        setCounter(1);
        expect(captured[0]).toBe(Function);
        setCounter(2);
        expect(captured[1]).toBe(Function);
        dispose();
      }, 0);
    });
  });

  it("atMost", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      const { count } = createCompositeEffect(atMost(counter, x => captured.push(x), { limit: 2 }));
      expect(count()).toBe(Function);

      setTimeout(() => {
        expect(count()).toBe(Function);
        expect(captured).toEqual(Function);
        setCounter(1);
        expect(count()).toBe(Function);
        expect(captured).toEqual(Function);
        setCounter(2);
        expect(count()).toBe(Function);
        expect(captured).toEqual(Function);
        dispose();
      }, 0);
    });
  });

  it("debounce", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      createCompositeEffect(debounce(counter, x => captured.push(x), 10));

      setTimeout(() => {
        expect(captured).toEqual(Function);
        setCounter(1);
        expect(captured).toEqual(Function);
      }, 0);

      setTimeout(() => {
        expect(captured).toEqual(Function);
        setCounter(7);
        setCounter(9);
        setTimeout(() => {
          expect(captured).toEqual(Function);
          dispose();
        }, 15);
      }, 15);
    });
  });

  it("throttle", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      createCompositeEffect(throttle(counter, x => captured.push(x), 10));

      setTimeout(() => {
        expect(captured).toEqual(Function);
        setCounter(1);
        expect(captured).toEqual(Function);
      }, 0);

      setTimeout(() => {
        expect(captured).toEqual(Function);
        setCounter(7);
        setCounter(9);
        setTimeout(() => {
          expect(captured).toEqual(Function);
          dispose();
        }, 15);
      }, 15);
    });
  });

  it("whenever", () => {
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
        expect(captured1).toEqual(Function);
        expect(captured2).toEqual(Function);
        setCounter(1);
        expect(captured1).toEqual(Function);
        expect(captured2).toEqual(Function);
        setCounter(2);
        expect(captured1).toEqual(Function);
        expect(captured2).toEqual(Function);
        setCounter(3);
        expect(captured1).toEqual(Function);
        expect(captured2).toEqual(Function);
        setCounter(4);
        expect(captured1).toEqual(Function);
        expect(captured2).toEqual(Function);
      }, 0);
    });
  });

  it("pausable", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captured: number[] = [];

      const { pause, resume, toggle } = createCompositeEffect(
        pausable(counter, () => captured.push(counter()), { active: false })
      );

      setTimeout(() => {
        expect(captured).toEqual(Function);
        setCounter(1);
        expect(captured).toEqual(Function);
        resume();
        setCounter(2);
        expect(captured).toEqual(Function);
        pause();
        setCounter(3);
        expect(captured).toEqual(Function);
        toggle();
        setCounter(4);
        expect(captured).toEqual(Function);
        toggle(true);
        setCounter(5);
        expect(captured).toEqual(Function);
        toggle(false);
        setCounter(6);
        expect(captured).toEqual(Function);
        dispose();
      }, 0);
    });
  });

  it("ignorable", () => {
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
        expect(captured).toEqual(Function);
        expect(counter()).toBe(Function);
        ignore(() => {
          // both changes will be ignored:
          setCounter(420);
          setCounter(69);
        });
        expect(captured).toEqual(Function);
        expect(counter()).toEqual(Function);
        // but not this one:
        setCounter(p => 111);
        expect(captured).toEqual(Function);
        dispose();
      }, 0);
    });
  });
});
