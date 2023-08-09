import { describe, it, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createPointerListeners } from "../src/index.js";

describe("createPointerListeners", () => {
  const move_event = new Event("pointermove"),
    enter_event = new Event("pointerenter"),
    up_event = new Event("pointerup"),
    ref = document.createElement("div");

  it("listens to pointer events", () => {
    createRoot(dispose => {
      const captured_events = {
        move: undefined as undefined | PointerEvent,
        enter: undefined as undefined | PointerEvent,
        up: undefined as undefined | PointerEvent,
      };

      createPointerListeners({
        target: ref,
        onMove: e => (captured_events.move = e),
        onEnter: e => (captured_events.enter = e),
        onUp: e => (captured_events.up = e),
      });

      ref.dispatchEvent(move_event);
      expect(captured_events.move).toBe(move_event);
      expect(captured_events.enter).toBe(undefined);
      expect(captured_events.up).toBe(undefined);

      ref.dispatchEvent(enter_event);
      expect(captured_events.enter).toBe(enter_event);

      ref.dispatchEvent(up_event);
      expect(captured_events.up).toBe(up_event);

      dispose();
    });
  });

  test("listeners are removed on dispose", () =>
    createRoot(dispose => {
      let captured_events = 0;

      createPointerListeners({
        target: ref,
        onMove: _ => captured_events++,
      });

      ref.dispatchEvent(move_event);
      expect(captured_events).toBe(1);

      dispose();

      ref.dispatchEvent(move_event);
      expect(captured_events).toBe(1);
    }));

  test("reactive target", () => {
    let captured_events = 0;
    const [target, setTarget] = createSignal<typeof ref | undefined>(ref);

    const dispose = createRoot(dispose => {
      createPointerListeners({
        target,
        onMove: _ => captured_events++,
      });

      ref.dispatchEvent(move_event);
      expect(captured_events).toBe(0);

      return dispose;
    });

    ref.dispatchEvent(move_event);
    expect(captured_events).toBe(1);

    setTarget();

    ref.dispatchEvent(move_event);
    expect(captured_events).toBe(1);

    setTarget(ref);

    ref.dispatchEvent(move_event);
    expect(captured_events).toBe(2);

    dispose();
  });
});
