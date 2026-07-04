import { createRoot, createSignal, flush } from "solid-js";
import { describe, test, expect } from "vitest";
import {
  createKeyDown,
  createKeyHold,
  createShortcut,
  useKeyDownEvent,
  useKeyDownList,
  useCurrentlyHeldKey,
  useKeyDownSequence,
} from "../src/index.js";

const dispatchKeyEvent = (
  key: string,
  type: "keydown" | "keyup",
  extra: Partial<KeyboardEvent> = {},
) => {
  const ev = new Event(type, { cancelable: true, bubbles: true }) as any;
  ev.key = key;
  Object.assign(ev, extra);
  window.dispatchEvent(ev);
  return ev as KeyboardEvent;
};

// Dispatches on a specific element (bubbling to the window listener) instead of
// window directly, so `event.target` reflects the focused element under test.
const dispatchKeyEventOn = (
  target: EventTarget,
  key: string,
  type: "keydown" | "keyup",
  extra: Partial<KeyboardEvent> = {},
) => {
  const ev = new Event(type, { cancelable: true, bubbles: true }) as any;
  ev.key = key;
  Object.assign(ev, extra);
  target.dispatchEvent(ev);
  return ev as KeyboardEvent;
};

describe("useKeyDownList", () => {
  test("returns a list of currently held keys", () =>
    createRoot(dispose => {
      const keys = useKeyDownList();
      expect(keys()).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(keys()).toEqual(["A"]);

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(keys()).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      flush();
      dispatchKeyEvent("q", "keydown");
      flush();
      expect(keys()).toEqual(["ALT", "Q"]);

      dispatchKeyEvent("Alt", "keyup");
      flush();
      dispatchKeyEvent("q", "keyup");
      flush();
      expect(keys()).toEqual([]);

      dispose();
    }));

  // https://github.com/solidjs-community/solid-primitives/issues/269
  // macOS never fires `keyup` for other keys held down together with Meta —
  // only Meta's own keyup arrives — so releasing Meta must clear the whole
  // list, or the other key's stale state corrupts the next press.
  test("clears all keys when Meta is released (macOS suppresses keyup for keys held with Meta)", () =>
    createRoot(dispose => {
      const keys = useKeyDownList();

      dispatchKeyEvent("Meta", "keydown", { metaKey: true });
      flush();
      dispatchKeyEvent("k", "keydown", { metaKey: true });
      flush();
      expect(keys()).toEqual(["META", "K"]);

      // macOS quirk: only Meta's keyup fires; "k" never gets its own keyup
      dispatchKeyEvent("Meta", "keyup");
      flush();
      expect(keys()).toEqual([]);

      dispose();
    }));

  test("useKeyDownEvent tracks the last keydown event", () =>
    createRoot(dispose => {
      const event = useKeyDownEvent();

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(event()).instanceOf(Event);
      expect(event()!.key).toBe("a");

      dispatchKeyEvent("Alt", "keydown");
      flush();
      expect(event()!.key).toBe("Alt");

      dispatchKeyEvent("Alt", "keyup");
      dispatchKeyEvent("a", "keyup");
      flush();
      expect(event()!.key).toBe("Alt");

      dispose();
    }));
});

describe("useCurrentlyHeldKey", () => {
  test("returns currently held key", () =>
    createRoot(dispose => {
      const key = useCurrentlyHeldKey();
      expect(key()).toBe(null);

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(key()).toBe("A");

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(key()).toBe(null);

      dispatchKeyEvent("Alt", "keydown");
      flush();
      expect(key()).toBe("ALT");
      dispatchKeyEvent("q", "keydown");
      flush();
      expect(key()).toBe(null);

      dispatchKeyEvent("Alt", "keyup");
      flush();
      expect(key()).toBe(null);
      dispatchKeyEvent("q", "keyup");
      flush();
      expect(key()).toBe(null);

      dispose();
    }));
});

describe("useKeyDownSequence", () => {
  test("returns sequence of pressing currently held keys", () =>
    createRoot(dispose => {
      const sequence = useKeyDownSequence();
      expect(sequence()).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(sequence()).toEqual([["A"]]);

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(sequence()).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      flush();
      expect(sequence()).toEqual([["ALT"]]);
      dispatchKeyEvent("q", "keydown");
      flush();
      expect(sequence()).toEqual([["ALT"], ["ALT", "Q"]]);

      dispatchKeyEvent("Alt", "keyup");
      flush();
      expect(sequence()).toEqual([["ALT"], ["ALT", "Q"], ["Q"]]);
      dispatchKeyEvent("q", "keyup");
      flush();
      expect(sequence()).toEqual([]);

      dispose();
    }));
});

describe("createKeyHold", () => {
  test("returns a boolean of is the wanted key pressed", () =>
    createRoot(dispose => {
      const isHeld = createKeyHold("ALT");
      expect(isHeld()).toBe(false);

      dispatchKeyEvent("ALT", "keydown");
      flush();
      expect(isHeld()).toBe(true);

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(isHeld()).toBe(false);

      dispose();
    }));
});

describe("createKeyDown", () => {
  // createKeyDown listens on document; events dispatched on window don't reach document listeners
  const dispatchDocumentKeyEvent = (key: string) => {
    const ev = new Event("keydown") as any;
    ev.key = key;
    document.dispatchEvent(ev);
  };

  test("fires callback when the matching key is pressed", () =>
    createRoot(dispose => {
      let fired = 0;
      createKeyDown("Escape", () => fired++);
      flush();

      dispatchDocumentKeyEvent("Escape");
      expect(fired).toBe(1);

      dispatchDocumentKeyEvent("Escape");
      expect(fired).toBe(2);

      dispose();
    }));

  test("does not fire for other keys", () =>
    createRoot(dispose => {
      let fired = 0;
      createKeyDown("Escape", () => fired++);
      flush();

      dispatchDocumentKeyEvent("Enter");
      dispatchDocumentKeyEvent("a");
      expect(fired).toBe(0);

      dispose();
    }));

  test("passes the keyboard event to the callback", () =>
    createRoot(dispose => {
      let received: KeyboardEvent | undefined;
      createKeyDown("Enter", e => (received = e));
      flush();

      dispatchDocumentKeyEvent("Enter");
      expect(received).toBeDefined();
      expect((received as any).key).toBe("Enter");

      dispose();
    }));

  test("disabled option prevents the callback from firing", () =>
    createRoot(dispose => {
      let fired = 0;
      createKeyDown("Escape", () => fired++, { disabled: true });
      flush();

      dispatchDocumentKeyEvent("Escape");
      expect(fired).toBe(0);

      dispose();
    }));

  test("disabled as accessor — reactively enables/disables the listener", () =>
    createRoot(dispose => {
      let fired = 0;
      // ownedWrite: true because the setter is called inside createRoot (an owned scope)
      const [disabled, setDisabled] = createSignal(true, { ownedWrite: true });
      createKeyDown("Escape", () => fired++, { disabled });
      flush();

      dispatchDocumentKeyEvent("Escape");
      expect(fired).toBe(0);

      setDisabled(false);
      flush();
      dispatchDocumentKeyEvent("Escape");
      expect(fired).toBe(1);

      dispose();
    }));

  test("removes the listener when disposed", () =>
    createRoot(dispose => {
      let fired = 0;
      createKeyDown("Escape", () => fired++);
      flush();

      dispose();
      dispatchDocumentKeyEvent("Escape");
      expect(fired).toBe(0);
    }));
});

describe("createShortcut", () => {
  test("fires callback when shortcut keys are pressed", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Control", "Shift", "A"], () => fired++);

      dispatchKeyEvent("Control", "keydown");
      dispatchKeyEvent("Shift", "keydown");
      dispatchKeyEvent("a", "keydown");
      expect(fired).toBe(1);

      dispatchKeyEvent("a", "keyup");
      dispatchKeyEvent("Shift", "keyup");
      dispatchKeyEvent("Control", "keyup");

      dispose();
    }));

  test("does not fire for partial key combinations", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Control", "A"], () => fired++);

      dispatchKeyEvent("Control", "keydown");
      expect(fired).toBe(0);

      dispatchKeyEvent("Control", "keyup");

      dispose();
    }));

  test("requireReset — fires only once until keys are released", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Control", "A"], () => fired++, { requireReset: false });

      dispatchKeyEvent("Control", "keydown");
      dispatchKeyEvent("a", "keydown");
      expect(fired).toBe(1);

      dispatchKeyEvent("a", "keyup");
      dispatchKeyEvent("a", "keydown");
      expect(fired).toBe(2);

      dispatchKeyEvent("Control", "keyup");
      dispatchKeyEvent("a", "keyup");

      dispose();
    }));

  // https://github.com/solidjs-community/solid-primitives/issues/269
  // macOS never fires `keyup` for other keys held down together with Meta —
  // only Meta's own keyup arrives — so a naive implementation accumulates
  // stale key state and fails (silently skipping preventDefault) on the
  // second press of the same Meta shortcut.
  test("repeated Meta shortcut presses keep working (macOS suppresses keyup for keys held with Meta)", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Meta", "P"], () => fired++);

      dispatchKeyEvent("Meta", "keydown", { metaKey: true });
      const p1 = dispatchKeyEvent("p", "keydown", { metaKey: true });
      expect(fired).toBe(1);
      expect(p1.defaultPrevented).toBe(true);

      // macOS quirk: only Meta's keyup fires; "p" never gets its own keyup
      dispatchKeyEvent("Meta", "keyup");

      dispatchKeyEvent("Meta", "keydown", { metaKey: true });
      const p2 = dispatchKeyEvent("p", "keydown", { metaKey: true });
      expect(fired).toBe(2);
      expect(p2.defaultPrevented).toBe(true);

      dispose();
    }));

  // https://github.com/solidjs-community/solid-primitives/issues/475
  describe("ignoreWithinInputs", () => {
    test("does not fire while focus is on an input", () =>
      createRoot(dispose => {
        const input = document.createElement("input");
        document.body.appendChild(input);
        let fired = 0;
        createShortcut(["S"], () => fired++, { ignoreWithinInputs: true });

        const ev = dispatchKeyEventOn(input, "s", "keydown");
        expect(fired).toBe(0);
        expect(ev.defaultPrevented).toBe(false);

        dispatchKeyEventOn(input, "s", "keyup");
        input.remove();
        dispose();
      }));

    test("does not fire while focus is on a textarea or select", () =>
      createRoot(dispose => {
        const textarea = document.createElement("textarea");
        const select = document.createElement("select");
        document.body.append(textarea, select);

        let fired = 0;
        createShortcut(["S"], () => fired++, { ignoreWithinInputs: true });

        for (const el of [textarea, select]) {
          dispatchKeyEventOn(el, "s", "keydown");
          dispatchKeyEventOn(el, "s", "keyup");
        }
        expect(fired).toBe(0);

        textarea.remove();
        select.remove();
        dispose();
      }));

    // jsdom doesn't implement `isContentEditable` (always undefined), so it's stubbed here
    // to exercise the branch as it behaves in a real browser.
    test("does not fire while focus is inside a contenteditable element", () =>
      createRoot(dispose => {
        const editableDiv = document.createElement("div");
        Object.defineProperty(editableDiv, "isContentEditable", { value: true });
        document.body.appendChild(editableDiv);

        let fired = 0;
        createShortcut(["S"], () => fired++, { ignoreWithinInputs: true });

        dispatchKeyEventOn(editableDiv, "s", "keydown");
        dispatchKeyEventOn(editableDiv, "s", "keyup");
        expect(fired).toBe(0);

        editableDiv.remove();
        dispose();
      }));

    test("still fires when focus is outside any input", () =>
      createRoot(dispose => {
        let fired = 0;
        createShortcut(["S"], () => fired++, { ignoreWithinInputs: true });

        dispatchKeyEventOn(document.body, "s", "keydown");
        expect(fired).toBe(1);

        dispatchKeyEventOn(document.body, "s", "keyup");
        dispose();
      }));

    test("fires normally when the option is not set, even from an input", () =>
      createRoot(dispose => {
        const input = document.createElement("input");
        document.body.appendChild(input);
        let fired = 0;
        createShortcut(["S"], () => fired++);

        dispatchKeyEventOn(input, "s", "keydown");
        expect(fired).toBe(1);

        dispatchKeyEventOn(input, "s", "keyup");
        input.remove();
        dispose();
      }));
  });
});
