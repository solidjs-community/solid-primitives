import { createRoot } from "solid-js";
import { describe, expect, test } from "vitest";
import { leading, leadingAndTrailing, throttle } from "../src";
import sleep from "./sleep";

describe("throttle", () => {
  test("setup and trigger throttle", async () => {
    let val = 0;
    const trigger = throttle((current: number) => (val = current), 20);
    expect(val).toBe(0);
    trigger(5);
    await sleep(50);
    expect(val).toBe(5);
  });

  test("trigger multiple throttles", async () => {
    let val = 0;
    const trigger = throttle((current: number) => (val = current), 20);
    trigger(5);
    trigger(1);
    await sleep(50);
    expect(val).toBe(1);
  });

  test("test clearing throttle", async () => {
    let val = 0;
    const trigger = throttle((current: number) => (val = current), 20);
    trigger(5);
    trigger.clear();
    await sleep(50);
    expect(val).toBe(0);
  });

  test("autoclearing throttle", async () => {
    let val = 0;
    createRoot(dispose => {
      const trigger = throttle((current: number) => (val = current), 20);
      trigger(5);
      dispose();
    });
    await sleep(50);
    expect(val).toBe(0);
  });
});

describe("leading throttle", () => {
  test("setup and trigger throttle", async () => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 20);
    expect(val).toBe(0);
    trigger(5);
    expect(val).toBe(5);
  });

  test("trigger multiple throttles", async () => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 20);
    trigger(5);
    trigger(1);
    expect(val).toBe(5);
    trigger(10);
    await sleep(50);
    expect(val).toBe(5);
    trigger(15);
    expect(val).toBe(15);
  });

  test("clearing", async () => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 20);
    trigger(5);
    trigger.clear();
    trigger(10);
    expect(val).toBe(10);
  });

  test("autoclearing", async () => {
    createRoot(dispose => {
      let val = 0;
      const trigger = leading(throttle, (current: number) => (val = current), 150);
      trigger(5);
      dispose();
      trigger(10);
      expect(val).toBe(10);
    });
  });
});

describe("leadingAndTrailing throttle", () => {
  test("setup and trigger throttle", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 20);
    expect(val).toBe(0);
    trigger(5);
    expect(val).toBe(5);
  });

  test("throttle only called once if only triggered once", async () => {
    let callCount = 0;
    const trigger = leadingAndTrailing(throttle, () => (callCount += 1), 10);
    expect(callCount).toBe(0);
    trigger();
    expect(callCount).toBe(1);
    await sleep(30);
    expect(callCount).toBe(1);
  });

  test("trigger throttles with pauses", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 20);
    trigger(5);
    trigger(1);
    expect(val).toBe(5);
    trigger(10);
    expect(val).toBe(5);
    await sleep(25); // sleep long enough for throttle to clear
    expect(val).toBe(10);
    trigger(15);
    expect(val).toBe(15);
  });

  test("clearing", async () => {
    let val = 0;
    const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 20);
    trigger(5);
    trigger.clear();
    trigger(10);
    expect(val).toBe(10);
  });

  test("autoclearing", async () => {
    createRoot(dispose => {
      let val = 0;
      const trigger = leadingAndTrailing(throttle, (current: number) => (val = current), 150);
      trigger(5);
      dispose();
      trigger(10);
      expect(val).toBe(10);
    });
  });
});
