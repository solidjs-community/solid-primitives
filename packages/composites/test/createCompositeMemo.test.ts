import exp from "constants";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { createCompositeMemo, pausable } from "../src";

describe("createCompositeMemo", () => {
  it("behaves like a normal memo", () => {
    createRoot(dispose => {
      const [count, setCount] = createSignal(2);

      const double = createCompositeMemo(count, x => x * 2);
      expect(double()).toBe(4);

      setCount(7);
      expect(double()).toBe(14);

      dispose();
    });
  });

  it("options are passed to createMemo", () => {
    createRoot(dispose => {
      const [count, setCount] = createSignal(2);

      const catchPrev: number[] = [];

      createCompositeMemo(
        count,
        (a, b, c) => {
          catchPrev.push(c as number);
          return a * 2;
        },
        {
          value: 10
        }
      );
      expect(catchPrev).toEqual([10]);

      setCount(7);
      expect(catchPrev).toEqual([10, 4]);

      dispose();
    });
  });

  it("applying modifiers", () => {
    createRoot(dispose => {
      const [count, setCount] = createSignal(2);

      const [double, { resume, pause }] = createCompositeMemo(
        pausable(count, x => x * 2, { active: false })
      );
      expect(double()).toBeUndefined();

      setCount(7);
      expect(double()).toBeUndefined();

      resume();
      expect(double()).toBeUndefined();
      setCount(10);
      expect(double()).toBe(20);

      pause();
      setCount(11);
      expect(double()).toBe(20);

      dispose();
    });
  });
});
