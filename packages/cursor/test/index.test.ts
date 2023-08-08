import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createBodyCursor, createElementCursor, CursorProperty } from "../src/index.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("createBodyCursor", () => {
  test("switches previous cursor to provided one", async () =>
    await createRoot(async dispose => {
      const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
      const [enabled, setEnabled] = createSignal(true);
      createBodyCursor(() => enabled() && cursor());
      await sleep(0);
      expect(document.body.style.cursor).toBe("pointer");
      setCursor("help");
      expect(document.body.style.cursor).toBe("help");
      setEnabled(false);
      expect(document.body.style.cursor, "unsets cursor").toBe("");
      setEnabled(true);
      expect(document.body.style.cursor).toBe("help");
      dispose();
      expect(document.body.style.cursor).toBe("");
    }));
});

describe("createElementCursor", () => {
  test("switches previous cursor to provided one", async () =>
    await createRoot(async dispose => {
      const div = document.createElement("div");
      const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
      const [enabled, setEnabled] = createSignal(true);
      createElementCursor(() => enabled() && div, cursor);
      await sleep(0);
      expect(div.style.cursor).toBe("pointer");
      setCursor("help");
      expect(div.style.cursor).toBe("help");
      setEnabled(false);
      expect(div.style.cursor, "unsets cursor").toBe("");
      setEnabled(true);
      expect(div.style.cursor).toBe("help");
      dispose();
      expect(div.style.cursor).toBe("");
    }));
  test("multiple targets", async () =>
    await createRoot(async dispose => {
      const div1 = document.createElement("div");
      const div2 = document.createElement("div");
      const [target, setTarget] = createSignal(div1);
      const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
      const [enabled, setEnabled] = createSignal(true);
      createElementCursor(() => enabled() && target(), cursor);
      await sleep(0);
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
    }));
});
