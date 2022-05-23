import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { debounce, leading } from "../src";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const deb = suite("debounce");

deb("setup and trigger debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const fn = (current: number) => {
      val = current;
    };
    const trigger = debounce(fn, 20);
    assert.is(val, 0);
    trigger(5);
    await sleep(50);
    assert.is(val, 5);
    dispose();
  })
);

deb("trigger multiple debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = debounce((current: number) => (val = current), 20);
    assert.is(val, 0);
    trigger(5);
    trigger(1);
    await sleep(50);
    assert.is(val, 1);
    dispose();
  })
);

deb("test clearing debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = debounce((current: number) => (val = current), 50);
    assert.is(val, 0);
    trigger(5);
    trigger.clear();
    await sleep(20);
    assert.is(val, 0);
    dispose();
  })
);

deb.run();

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

const ldeb = suite("leading debounce");

ldeb("setup and trigger debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = leading(debounce, (current: number) => (val = current), 20);
    assert.is(val, 0);
    trigger(5);
    assert.is(val, 5);
    trigger(10);
    assert.is(val, 5);
    await sleep(50);
    trigger(15);
    assert.is(val, 15);
    dispose();
  })
);

ldeb("test clearing debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = leading(debounce, (current: number) => (val = current), 20);
    trigger(5);
    trigger.clear();
    trigger(10);
    assert.is(val, 10);
    dispose();
  })
);

ldeb.run();
