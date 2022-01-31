import { dispatchFakeEvent } from "./setup";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot } from "solid-js";
import { createEventListenerBus } from "../src";

const test = suite("createEventListenerBus");

test("listening to events", () =>
  createRoot(dispose => {
    const testEvent = new Event("test");
    const testEvent2 = new Event("test2");
    let capturedEvent: Event;
    const bus = createEventListenerBus<Record<string, Event>>();
    bus.ontest(ev => {
      capturedEvent = ev;
    });
    dispatchFakeEvent("test", testEvent);
    assert.is(capturedEvent, testEvent);
    dispatchFakeEvent("test2", testEvent);
    assert.is(capturedEvent, testEvent);
    bus.ontest2(ev => {
      capturedEvent = ev;
    });
    dispatchFakeEvent("test2", testEvent2);
    assert.is(capturedEvent, testEvent2);
    dispatchFakeEvent("test", testEvent);
    assert.is(capturedEvent, testEvent);
    dispose();
  }));

test("passing event type to on()", () =>
  createRoot(dispose => {
    const testEvent = new Event("test");
    const testEvent2 = new Event("test2");
    let capturedEvent: Event;
    const bus = createEventListenerBus<Record<string, Event>>();
    bus.on("test", ev => {
      capturedEvent = ev;
    });
    dispatchFakeEvent("test", testEvent);
    assert.is(capturedEvent, testEvent);
    dispatchFakeEvent("test2", testEvent);
    assert.is(capturedEvent, testEvent);
    bus.on(
      () => "test2",
      ev => {
        capturedEvent = ev;
      }
    );
    dispatchFakeEvent("test2", testEvent2);
    assert.is(capturedEvent, testEvent2);
    dispatchFakeEvent("test", testEvent);
    assert.is(capturedEvent, testEvent);
    dispose();
  }));

// unsub() cannot be tested because solid-register disables reactivity in dependencies

// test("listeners returns unsub()", () =>
//   createRoot(dispose => {
//     const testEvent3 = new Event("test3");
//     const testEvent4 = new Event("test4");
//     let capturedEvent: Event;
//     const bus = createEventListenerBus<Record<string, Event>>(window);
//     const unsub = bus.ontest3(ev => {
//       capturedEvent = ev;
//     });
//     bus.ontest4(ev => {
//       capturedEvent = ev;
//     });
//     unsub();
//     setTimeout(() => {
//       dispatchFakeEvent("test3", testEvent3);
//       assert.is(capturedEvent, undefined, "event shouldn't be captured");
//       dispatchFakeEvent("test4", testEvent4);
//       assert.is(capturedEvent, testEvent4);
//       dispose();
//     }, 0);
//   }));

test.run();
