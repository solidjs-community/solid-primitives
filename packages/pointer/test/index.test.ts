import { describe, it, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createPointerListeners } from "../src";

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("createPointerListeners", () => {
  it("listens to pointer events", () =>
    createRoot(dispose => {
      let captured_events = {
        move: undefined as undefined | PointerEvent,
        enter: undefined as undefined | PointerEvent,
        up: undefined as undefined | PointerEvent
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
      expect(captured_events.move).toBe(move_event);
      expect(captured_events.enter).toBe(undefined);
      expect(captured_events.up).toBe(undefined);

      window.dispatchEvent(enter_event);
      expect(captured_events.enter).toBe(enter_event);

      window.dispatchEvent(up_event);
      expect(captured_events.up).toBe(up_event);

      dispose();
    }));

  test("listeners are removed on dispose", () =>
    createRoot(dispose => {
      let captured_events = 0;
      const move_event = new Event("pointermove");

      createPointerListeners({
        target: window,
        onMove: e => captured_events++
      });

      window.dispatchEvent(move_event);
      expect(captured_events).toBe(1);

      dispose();

      window.dispatchEvent(move_event);
      expect(captured_events).toBe(1);
    }));

  // there is something wrong with this test for some reason

  // test("reactive target", async () =>
  //   createRoot(async dispose => {
  //     let captured_events = 0;
  //     const move_event = new Event("pointermove");
  //     const [target, setTarget] = createSignal<Window | undefined>(window);

  //     createPointerListeners({
  //       target,
  //       onMove: e => captured_events++
  //     });

  //     window.dispatchEvent(move_event);
  //     expect(captured_events, "listener will be added onMount").toBe(0);

  //     await sleep(0);

  //     window.dispatchEvent(move_event);
  //     expect(captured_events).toBe(1);

  //     setTarget();

  //     await sleep(0);

  //     window.dispatchEvent(move_event);
  //     expect(captured_events).toBe(1);

  //     setTarget(window);

  //     await sleep(0);

  //     window.dispatchEvent(move_event);
  //     expect(captured_events).toBe(2);

  //     dispose();
  //   }));
});
