import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { throttle, leading } from "../src";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const test = suite("throttle");

test("setup and trigger throttle", async () => {
  let val = 0;
  const trigger = throttle((current: number) => (val = current), 20);
  assert.is(val, 0);
  trigger(5);
  await sleep(50);
  assert.is(val, 5);
});

test("trigger multiple throttles", async () => {
  let val = 0;
  const trigger = throttle((current: number) => (val = current), 20);
  trigger(5);
  trigger(1);
  await sleep(50);
  assert.is(val, 1);
});

test("test clearing throttle", async () => {
  let val = 0;
  const trigger = throttle((current: number) => (val = current), 20);
  trigger(5);
  trigger.clear();
  await sleep(50);
  assert.is(val, 0);
});

test("autoclearing throttle", async () => {
  let val = 0;
  createRoot(dispose => {
    const trigger = throttle((current: number) => (val = current), 20);
    trigger(5);
    dispose();
  });
  await sleep(50);
  assert.is(val, 0);
});

test.run();

const testLead = suite("leading throttle");

testLead("setup and trigger throttle", async () => {
  let val = 0;
  const trigger = leading(throttle, (current: number) => (val = current), 20);
  assert.is(val, 0);
  trigger(5);
  assert.is(val, 5);
});

testLead("trigger multiple throttles", async () => {
  let val = 0;
  const trigger = leading(throttle, (current: number) => (val = current), 20);
  trigger(5);
  trigger(1);
  assert.is(val, 5);
  trigger(10);
  await sleep(50);
  assert.is(val, 5);
  trigger(15);
  assert.is(val, 15);
});

testLead("clearing", async () => {
  let val = 0;
  const trigger = leading(throttle, (current: number) => (val = current), 20);
  trigger(5);
  trigger.clear();
  trigger(10);
  assert.is(val, 10);
});

testLead("autoclearing", async () => {
  createRoot(dispose => {
    let val = 0;
    const trigger = leading(throttle, (current: number) => (val = current), 150);
    trigger(5);
    dispose();
    trigger(10);
    assert.is(val, 10);
  });
});

testLead.run();
