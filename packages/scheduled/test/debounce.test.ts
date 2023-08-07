import { createRoot } from "solid-js";
import { describe, expect, test } from "vitest";
import { debounce, leading, leadingAndTrailing } from "../src";
import sleep from "./sleep";

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
  const tc1 = debounce((n: number) => {}, 10000);
  // @ts-expect-error
  tc1();
  tc1(1);
  // @ts-expect-error
  tc1("string");
  tc1.clear();
  const tc2 = debounce((n: number | string, u: string) => {}, 10000);
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

describe("leadingAndTrailing debounce", () => {
  test("setup and trigger debounce", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 20);
    expect(val).toBe(0);
    trigger(5);
    expect(val).toBe(5);
  });

  test("debounce only called once if only triggered once", async () => {
    let callCount = 0;
    const trigger = leadingAndTrailing(debounce, () => (callCount += 1), 10);
    expect(callCount).toBe(0);
    trigger();
    expect(callCount).toBe(1);
    await sleep(30);
    expect(callCount).toBe(1);
  });

  test("trigger debounces with pauses", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 20);
    trigger(5);
    trigger(1);
    expect(val).toBe(5);
    await sleep(15); // do not sleep long enough for debounce to clear
    trigger(1);
    expect(val).toBe(5);
    trigger(10);
    expect(val).toBe(5);
    await sleep(25); // sleep long enough for debounce to clear
    expect(val).toBe(10);
    trigger(15);
    expect(val).toBe(15);
  });

  test("clearing", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 20);
    trigger(5);
    trigger.clear();
    trigger(10);
    expect(val).toBe(10);
  });

  test("autoclearing", async () => {
    createRoot(dispose => {
      let val = 0;
      const trigger = leadingAndTrailing(debounce, (current: number) => (val = current), 150);
      trigger(5);
      dispose();
      trigger(10);
      expect(val).toBe(10);
    });
  });
});
