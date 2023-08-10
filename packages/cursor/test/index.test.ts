import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createBodyCursor, createElementCursor, CursorProperty } from "../src/index.js";

describe("createBodyCursor", () => {
  test("switches previous cursor to provided one", () => {
    const [enabled, setEnabled] = createSignal(true);
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");

    const dispose = createRoot(dispose => {
      createBodyCursor(() => enabled() && cursor());
      return dispose;
    });

    expect(document.body.style.cursor).toBe("pointer");

    setCursor("help");
    expect(document.body.style.cursor).toBe("help");

    setEnabled(false);
    expect(document.body.style.cursor, "unsets cursor").toBe("");

    setEnabled(true);
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

    expect(div.style.cursor).toBe("pointer");

    setCursor("help");
    expect(div.style.cursor).toBe("help");

    setEnabled(false);
    expect(div.style.cursor, "unsets cursor").toBe("");

    setEnabled(true);
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

    expect(div1.style.cursor).toBe("pointer");

    setCursor("help");
    expect(div1.style.cursor).toBe("help");

    setTarget(div2);
    expect(div1.style.cursor).toBe("");
    expect(div2.style.cursor).toBe("help");

    setEnabled(false);
    expect(div2.style.cursor).toBe("");

    setTarget(div1);
    expect(div1.style.cursor).toBe("");
    expect(div2.style.cursor).toBe("");

    setCursor("pointer");
    expect(div1.style.cursor).toBe("");
    expect(div2.style.cursor).toBe("");

    setEnabled(true);
    expect(div1.style.cursor).toBe("pointer");
    expect(div2.style.cursor).toBe("");

    dispose();
    expect(div1.style.cursor).toBe("");
  });
});
