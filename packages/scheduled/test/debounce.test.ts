import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { debounce, leading } from "../src";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("debounce", () => {
  test("setup and trigger debounce", () =>
    createRoot(async dispose => {
      let val = 0;
      const fn = (current: number) => {
        val = current;
      };
      const trigger = debounce(fn, 20);
      expect(val).toBe(0);
      trigger(5);
      await sleep(50);
      expect(val).toBe(5);
      dispose();
    }));

  test("trigger multiple debounce", () =>
    createRoot(async dispose => {
      let val = 0;
      const trigger = debounce((current: number) => (val = current), 20);
      expect(val).toBe(0);
      trigger(5);
      trigger(1);
      await sleep(50);
      expect(val).toBe(1);
      dispose();
    }));

  test("test clearing debounce", () =>
    createRoot(async dispose => {
      let val = 0;
      const trigger = debounce((current: number) => (val = current), 50);
      expect(val).toBe(0);
      trigger(5);
      trigger.clear();
      await sleep(20);
      expect(val).toBe(0);
      dispose();
    }));
});

function typeChecks() {
  const tc1 = debounce((n: number) => console.log(n), 10000);
  // @ts-expect-error
  tc1();
  tc1(1);
  // @ts-expect-error
  tc1("string");
  tc1.clear();
  const tc2 = debounce((n: number | string, u: string) => console.log(n, u), 10000);
  // @ts-expect-error
  tc2();
  // @ts-expect-error
  tc2(2);
  tc2(1, "");
  // @ts-expect-error
  tc1("string", 2);
  tc1.clear();
}

describe("leading debounce", () => {
  test("setup and trigger debounce", () =>
    createRoot(async dispose => {
      let val = 0;
      const trigger = leading(debounce, (current: number) => (val = current), 20);
      expect(val).toBe(0);
      trigger(5);
      expect(val).toBe(5);
      trigger(10);
      expect(val).toBe(5);
      await sleep(50);
      trigger(15);
      expect(val).toBe(15);
      dispose();
    }));

  test("test clearing debounce", () =>
    createRoot(async dispose => {
      let val = 0;
      const trigger = leading(debounce, (current: number) => (val = current), 20);
      trigger(5);
      trigger.clear();
      trigger(10);
      expect(val).toBe(10);
      dispose();
    }));
});
