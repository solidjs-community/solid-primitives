import { dispatchFakeEvent } from "./setup";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, onMount } from "solid-js";
import { createEventListenerMap, createEventStore } from "../src";

const test = suite("createEventListenerMap");

test("will listen to multiple events", () =>
  createRoot(dispose => {
    const testEvent = new Event("map_0");
    const testEvent1 = new Event("map_1");
    let captured: any;
    let captured1: any;
    createEventListenerMap(window, {
      map_0: e => (captured = e),
      map_1: e => (captured1 = e)
    });

    dispatchFakeEvent("map_0", testEvent);
    dispatchFakeEvent("map_1", testEvent1);

    assert.is(captured, testEvent);
    assert.is(captured1, testEvent1);
    dispose();
  }));

test("target accessor", () =>
  createRoot(dispose => {
    const testEvent = new Event("map_0");
    const testEvent1 = new Event("map_1");
    let captured: any;
    let captured1: any;
    createEventListenerMap(() => window, {
      map_0: e => (captured = e),
      map_1: e => (captured1 = e)
    });

    onMount(() => {
      dispatchFakeEvent("map_0", testEvent);
      dispatchFakeEvent("map_1", testEvent1);

      assert.is(captured, testEvent);
      assert.is(captured1, testEvent1);
      dispose();
    });
  }));

test("stops listeneing after disposing of root", () =>
  createRoot(dispose => {
    const testEvent = new Event("map_0");
    const testEvent1 = new Event("map_1");
    let captured: any;
    let captured1: any;
    createEventListenerMap(window, {
      map_0: e => (captured = e),
      map_1: e => (captured1 = e)
    });

    onMount(() => {
      dispose();

      dispatchFakeEvent("map_0", testEvent);
      dispatchFakeEvent("map_1", testEvent1);

      assert.is(captured, undefined);
      assert.is(captured1, undefined);
    });
  }));

test("target and options can be signals", () =>
  createRoot(dispose => {
    const testEvent = new Event("map_0");
    let captured: any;
    createEventListenerMap<{ map_0: Event }>(
      () => window,
      {
        map_0: e => (captured = e)
      },
      () => ({ passive: true })
    );

    onMount(() => {
      dispatchFakeEvent("map_0", testEvent);
      assert.is(captured, testEvent);
      dispose();
    });
  }));

const testStore = suite("createEventStore");

testStore("returns autoupdating store", () =>
  createRoot(dispose => {
    const testEvent = new Event("map_0");
    const testEvent1 = new Event("map_1");
    const [store] = createEventStore(window, "map_0", "map_1");
    assert.type(store, "object");
    assert.type(store.map_0, "undefined");
    assert.type(store.map_1, "undefined");

    onMount(() => {
      dispatchFakeEvent("map_0", testEvent);
      dispatchFakeEvent("map_1", testEvent1);
      assert.type(store.map_0, "undefined", "effects will take place in the next effect");
      assert.type(store.map_1, "undefined", "effects will take place in the next effect");

      setTimeout(() => {
        assert.is(store.map_0, testEvent);
        assert.is(store.map_1, testEvent1);
        dispose();
      }, 0);
    });
  })
);

testStore("store cannot be destructured", () =>
  createRoot(dispose => {
    const testEvent = new Event("map_3");
    const testEvent1 = new Event("map_4");
    const [{ map_3, map_4 }] = createEventStore(window, "map_3", "map_4");
    assert.type(map_3, "undefined");
    assert.type(map_4, "undefined");

    onMount(() => {
      dispatchFakeEvent("map_3", testEvent);
      dispatchFakeEvent("map_4", testEvent1);

      setTimeout(() => {
        assert.type(map_3, "undefined");
        assert.type(map_4, "undefined");
        dispose();
      }, 0);
    });
  })
);

test.run();
testStore.run();
