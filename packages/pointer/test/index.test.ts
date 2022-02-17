import { createPointerListeners } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testCPL = suite("createPointerListeners");

testCPL("listens to pointer events", () =>
  createRoot(dispose => {
    let captured_events = {
      move: undefined,
      enter: undefined,
      up: undefined
    };
    const move_event = new Event("pointermove");
    const enter_event = new Event("pointerenter");
    const up_event = new Event("pointerup");

    createPointerListeners({
      target: window,
      onMove: e => (captured_events.move = e),
      onEnter: e => (captured_events.enter = e),
      onUp: e => (captured_events.up = e)
    });

    window.dispatchEvent(move_event);
    assert.is(captured_events.move, move_event);
    assert.is(captured_events.enter, undefined);
    assert.is(captured_events.up, undefined);

    window.dispatchEvent(enter_event);
    assert.is(captured_events.enter, enter_event);

    window.dispatchEvent(up_event);
    assert.is(captured_events.up, up_event);

    dispose();
  })
);

testCPL("clear function", () =>
  createRoot(dispose => {
    let captured_event;
    const move_event1 = new Event("pointermove");
    const move_event2 = new Event("pointermove");

    const clear = createPointerListeners({
      target: window,
      onMove: e => (captured_event = e)
    });

    window.dispatchEvent(move_event1);
    assert.is(captured_event, move_event1);

    clear();

    window.dispatchEvent(move_event2);
    assert.is(captured_event, move_event1);

    dispose();
  })
);

// cannot test this because of solid-register's cjs conversion (disables reactivity in solid in dependencies)

// testCPL("listeners are removed on dispose", () =>
//   createRoot(dispose => {
//     let captured_events = 0;
//     const move_event = new Event("pointermove");

//     createPointerListeners({
//       target: window,
//       onMove: e => captured_events++
//     });

//     window.dispatchEvent(move_event);
//     assert.is(captured_events, 1);

//     dispose();

//     window.dispatchEvent(move_event);
//     assert.is(captured_events, 1);
//   }));

// testCPL("reactive target", () =>
//   createRoot(dispose => {
//     let captured_events = 0;
//     const move_event = new Event("pointermove");
//     const [target, setTarget] = createSignal(window);

//     createPointerListeners({
//       target,
//       onMove: e => captured_events++
//     });

//     window.dispatchEvent(move_event);
//     assert.is(captured_events, 0, "listener will be added onMount");

//     setTimeout(() => {
//       window.dispatchEvent(move_event);
//       assert.is(captured_events, 1);

//       setTarget(undefined);

//       setTimeout(() => {
//         window.dispatchEvent(move_event);
//         assert.is(captured_events, 1);

//         setTarget(window);

//         setTimeout(() => {
//           window.dispatchEvent(move_event);
//           assert.is(captured_events, 2);

//           dispose();
//         }, 1);
//       }, 1);
//     }, 0);
//   }));

testCPL.run();
