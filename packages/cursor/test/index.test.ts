import { describe, test, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import {
  createBodyCursor,
  createDragCursor,
  createElementCursor,
  cursorRef,
  makeBodyCursor,
  makeElementCursor,
  type CursorProperty,
} from "../src/index.js";

describe("makeBodyCursor", () => {
  test("sets cursor and returns cleanup", () => {
    const restore = makeBodyCursor("pointer");
    expect(document.body.style.cursor).toBe("pointer");
    restore();
    expect(document.body.style.cursor).toBe("");
  });

  test("restores nested cursors in stack order", () => {
    const restore1 = makeBodyCursor("pointer");
    const restore2 = makeBodyCursor("help");
    expect(document.body.style.cursor).toBe("help");
    restore2();
    expect(document.body.style.cursor).toBe("pointer");
    restore1();
    expect(document.body.style.cursor).toBe("");
  });
});

describe("makeElementCursor", () => {
  test("sets cursor on element and returns cleanup", () => {
    const el = document.createElement("div");
    const restore = makeElementCursor(el, "pointer");
    expect(el.style.cursor).toBe("pointer");
    restore();
    expect(el.style.cursor).toBe("");
  });

  test("restores previous cursor value", () => {
    const el = document.createElement("div");
    const restore1 = makeElementCursor(el, "pointer");
    const restore2 = makeElementCursor(el, "help");
    expect(el.style.cursor).toBe("help");
    restore2();
    expect(el.style.cursor).toBe("pointer");
    restore1();
    expect(el.style.cursor).toBe("");
  });
});

describe("createBodyCursor", () => {
  test("switches previous cursor to provided one", () => {
    const [enabled, setEnabled] = createSignal(true);
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");

    const dispose = createRoot(dispose => {
      createBodyCursor(() => enabled() && cursor());
      return dispose;
    });
    flush();

    expect(document.body.style.cursor).toBe("pointer");

    setCursor("help");
    flush();
    expect(document.body.style.cursor).toBe("help");

    setEnabled(false);
    flush();
    expect(document.body.style.cursor, "unsets cursor").toBe("");

    setEnabled(true);
    flush();
    expect(document.body.style.cursor).toBe("help");

    dispose();
    expect(document.body.style.cursor).toBe("");
  });
});

describe("createElementCursor", () => {
  test("switches previous cursor to provided one", () => {
    const div = document.createElement("div");
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
    const [enabled, setEnabled] = createSignal(true);

    const dispose = createRoot(dispose => {
      createElementCursor(() => enabled() && div, cursor);
      return dispose;
    });
    flush();

    expect(div.style.cursor).toBe("pointer");

    setCursor("help");
    flush();
    expect(div.style.cursor).toBe("help");

    setEnabled(false);
    flush();
    expect(div.style.cursor, "unsets cursor").toBe("");

    setEnabled(true);
    flush();
    expect(div.style.cursor).toBe("help");

    dispose();
    expect(div.style.cursor).toBe("");
  });

  test("multiple targets", () => {
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const [target, setTarget] = createSignal(div1);
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
    const [enabled, setEnabled] = createSignal(true);

    const dispose = createRoot(dispose => {
      createElementCursor(() => enabled() && target(), cursor);
      return dispose;
    });
    flush();

    expect(div1.style.cursor).toBe("pointer");

    setCursor("help");
    flush();
    expect(div1.style.cursor).toBe("help");

    setTarget(div2);
    flush();
    expect(div1.style.cursor).toBe("");
    expect(div2.style.cursor).toBe("help");

    setEnabled(false);
    flush();
    expect(div2.style.cursor).toBe("");

    setTarget(div1);
    flush();
    expect(div1.style.cursor).toBe("");
    expect(div2.style.cursor).toBe("");

    setCursor("pointer");
    flush();
    expect(div1.style.cursor).toBe("");
    expect(div2.style.cursor).toBe("");

    setEnabled(true);
    flush();
    expect(div1.style.cursor).toBe("pointer");
    expect(div2.style.cursor).toBe("");

    dispose();
    expect(div1.style.cursor).toBe("");
  });
});

describe("createDragCursor", () => {
  test("shows grab/grabbing cursors during drag", () => {
    const el = document.createElement("div");

    const dispose = createRoot(dispose => {
      createDragCursor(el);
      return dispose;
    });
    flush();

    expect(el.style.cursor).toBe("grab");
    expect(document.body.style.cursor).toBe("");

    el.dispatchEvent(new Event("pointerdown"));
    flush();
    expect(document.body.style.cursor).toBe("grabbing");
    expect(el.style.cursor).toBe("");

    document.dispatchEvent(new Event("pointerup"));
    flush();
    expect(document.body.style.cursor).toBe("");
    expect(el.style.cursor).toBe("grab");

    dispose();
    expect(el.style.cursor).toBe("");
  });

  test("resets on pointercancel", () => {
    const el = document.createElement("div");

    const dispose = createRoot(dispose => {
      createDragCursor(el);
      return dispose;
    });
    flush();

    el.dispatchEvent(new Event("pointerdown"));
    flush();
    expect(document.body.style.cursor).toBe("grabbing");

    document.dispatchEvent(new Event("pointercancel"));
    flush();
    expect(document.body.style.cursor).toBe("");
    expect(el.style.cursor).toBe("grab");

    dispose();
  });

  test("supports custom cursor values", () => {
    const el = document.createElement("div");

    const dispose = createRoot(dispose => {
      createDragCursor(el, { grab: "crosshair", grabbing: "move" });
      return dispose;
    });
    flush();

    expect(el.style.cursor).toBe("crosshair");

    el.dispatchEvent(new Event("pointerdown"));
    flush();
    expect(document.body.style.cursor).toBe("move");

    document.dispatchEvent(new Event("pointerup"));
    flush();
    expect(el.style.cursor).toBe("crosshair");

    dispose();
  });

  test("cleans up listeners and cursors on dispose", () => {
    const el = document.createElement("div");

    const dispose = createRoot(dispose => {
      createDragCursor(el);
      return dispose;
    });
    flush();

    dispose();
    expect(el.style.cursor).toBe("");
    expect(document.body.style.cursor).toBe("");

    el.dispatchEvent(new Event("pointerdown"));
    flush();
    expect(document.body.style.cursor).toBe("");
  });
});

describe("cursorRef", () => {
  test("applies cursor to element", () => {
    const el = document.createElement("div");

    const dispose = createRoot(dispose => {
      cursorRef("pointer")(el);
      return dispose;
    });
    flush();

    expect(el.style.cursor).toBe("pointer");

    dispose();
    expect(el.style.cursor).toBe("");
  });

  test("reacts to cursor signal changes", () => {
    const el = document.createElement("div");
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");

    const dispose = createRoot(dispose => {
      cursorRef(cursor)(el);
      return dispose;
    });
    flush();

    expect(el.style.cursor).toBe("pointer");

    setCursor("help");
    flush();
    expect(el.style.cursor).toBe("help");

    dispose();
    expect(el.style.cursor).toBe("");
  });
});
