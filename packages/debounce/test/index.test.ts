import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import createDebounce from "../src/index";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const test = suite("createDebounce");

test("setup and trigger debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const fn = (current: number) => {
      val = current;
    };
    const trigger = createDebounce(fn, 150);
    assert.is(val, 0);
    trigger(5);
    await sleep(300);
    assert.is(val, 5);
    dispose();
  }));

test("trigger multiple debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = createDebounce(current => (val = current), 150);
    assert.is(val, 0);
    trigger(5);
    trigger(1);
    await sleep(300);
    assert.is(val, 1);
    dispose();
  }));

test("test clearing debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = createDebounce(current => (val = current), 500);
    assert.is(val, 0);
    trigger(5);
    trigger.clear();
    await sleep(300);
    assert.is(val, 0);
    dispose();
  }));

test.run();

function typeChecks() {
  const tc1 = createDebounce((n: number) => console.log(n), 10000);
  // @ts-expect-error
  tc1();
  tc1(1);
  // @ts-expect-error
  tc1("string");
  tc1.clear();
  const tc2 = createDebounce((n: number | string, u: string) => console.log(n, u), 10000);
  // @ts-expect-error
  tc2();
  // @ts-expect-error
  tc2(2);
  tc2(1, "");
  // @ts-expect-error
  tc1("string", 2);
  tc1.clear();
}
