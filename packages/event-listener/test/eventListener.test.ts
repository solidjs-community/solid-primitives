import { dispatchFakeEvent } from "./setup";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createSignal, onMount } from "solid-js";
import {
  createEventListener,
  createEventSignal,
  eventListener,
  EventListenerDirectiveProps
} from "../src";

const test = suite("createEventListener");

test("single window target", () => {
  createRoot(dispose => {
    const testEvent = new Event("test");
    let capturedEvent: Event;
    createEventListener<{ test: Event }>(window, "test", ev => {
      capturedEvent = ev;
    });
    dispatchFakeEvent("test", testEvent);
    assert.is(capturedEvent, testEvent);
    dispose();
  });
});

test("array window target", () => {
  createRoot(dispose => {
    const testEvent = new Event("test");
    let capturedEvent: Event;
    createEventListener<{ test: Event }>([window, document.createElement("p")], "test", ev => {
      capturedEvent = ev;
    });
    dispatchFakeEvent("test", testEvent);
    assert.is(capturedEvent, testEvent);
    dispose();
  });
});

test("accessor window target", () => {
  createRoot(dispose => {
    const [target, setTarget] = createSignal(window);
    const testEvent = new Event("test");
    let captured_times = 0;
    createEventListener<{ test: Event }>(target, "test", ev => {
      captured_times++;
    });
    dispatchFakeEvent("test", testEvent);
    assert.is(captured_times, 0, "event listener won't be added yet");

    setTimeout(() => {
      dispatchFakeEvent("test", testEvent);
      assert.is(captured_times, 1);

      setTarget(undefined);

      setTimeout(() => {
        dispatchFakeEvent("test", testEvent);
        assert.is(captured_times, 1);

        setTarget(window);

        setTimeout(() => {
          dispatchFakeEvent("test", testEvent);
          assert.is(captured_times, 2);
          dispose();
        }, 0);
      }, 0);
    }, 0);
  });
});

test("listening multiple events", () => {
  createRoot(dispose => {
    const event1 = new Event("test1");
    const event2 = new Event("test2");
    let capturedEvent: Event;
    createEventListener<{ test1: Event; test2: Event }>(window, ["test1", "test2"], ev => {
      capturedEvent = ev;
    });
    dispatchFakeEvent("test1", event1);
    assert.is(capturedEvent, event1);
    dispatchFakeEvent("test1", event2);
    assert.is(capturedEvent, event2);
    dispose();
  });
});

test("it will only add the event once", () => {
  createRoot(dispose => {
    const testEvent = new Event("test2");
    let count = 0;
    createEventListener<{ test2: Event }>(window, "test2", ev => {
      count++;
    });
    setTimeout(() => {
      dispatchFakeEvent("test2", testEvent);
      assert.is(count, 1);
      dispose();
    }, 10);
  });
});

test("disposing on cleanup", () =>
  createRoot(dispose => {
    const testEvent = new Event("test3");
    let count = 0;
    createEventListener<{ test3: Event }>(window, "test3", () => {
      count++;
    });

    onMount(() => {
      dispatchFakeEvent("test3", testEvent);
      assert.is(count, 1, "captured count on mount should be 1");

      dispose();

      dispatchFakeEvent("test3", testEvent);
      assert.is(count, 1, "captured count after disposing should still be 1");
    });
  }));

const signalTest = suite("createEventSignal");

signalTest("return autoupdating signal", () =>
  createRoot(dispose => {
    const testEvent = new Event("sig_test");
    const [lastEvent] = createEventSignal<{ sig_test: Event }>(window, "sig_test");
    assert.type(lastEvent, "function", "returned value is an accessor");
    assert.type(lastEvent(), "undefined", "returned value is undefined");

    onMount(() => {
      dispatchFakeEvent("sig_test", testEvent);
      assert.type(
        lastEvent(),
        "undefined",
        "lastEvent will shouldn't be available in the same effect"
      );

      setTimeout(() => {
        assert.is(lastEvent(), testEvent);
        dispose();
      }, 0);
    });
  })
);

const directiveTest = suite("eventListener");

directiveTest("will work as directive and update the event", () =>
  createRoot(dispose => {
    const testEvent = new Event("load");
    const captured: any[] = [];
    const captured2: any[] = [];
    const [props, setProps] = createSignal<EventListenerDirectiveProps>([
      "load",
      e => captured.push(e)
    ]);
    eventListener(window as any, props);
    dispatchFakeEvent("load", testEvent);
    assert.is(captured.length, 0, "event are not listened before the first effect");

    onMount(() => {
      dispatchFakeEvent("load", testEvent);
      assert.is(captured.length, 1, "one event after mounted should be captured");
      assert.is(captured[0], testEvent, "event after mounted should be captured");

      setProps(["load", e => captured2.push(e)]);

      dispatchFakeEvent("load", testEvent);
      assert.is(captured.length, 2, "changed props will take effect in the next effect");

      setTimeout(() => {
        dispatchFakeEvent("load", testEvent);
        assert.is(
          captured.length,
          2,
          "events should no longer be captured by the previous handler"
        );
        assert.is(captured2.length, 1);
        dispose();
      }, 10);
    });
  })
);

test.run();
signalTest.run();
directiveTest.run();
