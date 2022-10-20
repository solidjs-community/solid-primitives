import { createEmitter } from "../src";
import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";

describe("createEmitter", () => {
  test("emitting and listening", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit } = createEmitter<string, number, boolean>();

      listen((...args) => captured.push(args));

      emit("foo", 1, true);
      expect(captured[0]).toEqual(["foo", 1, true]);

      emit("bar", 2, false);
      expect(captured[1]).toEqual(["bar", 2, false]);

      dispose();
    }));

  test("clear function", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit, clear } = createEmitter<string>();

      listen(a => captured.push(a));

      clear();

      emit("foo");
      expect(captured.length).toBe(0);

      dispose();
    }));

  test("clears on dispose", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit } = createEmitter<string>();

      listen(a => captured.push(a));

      dispose();

      emit("foo");
      expect(captured.length).toBe(0);
    }));

  test("remove()", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit, remove } = createEmitter<string>();

      const listener = (a: string) => captured.push(a);
      listen(listener);

      remove(listener);

      emit("foo");
      expect(captured).toEqual([]);

      const unsub = listen(listener);
      unsub();

      emit("bar");
      expect(captured).toEqual([]);

      dispose();
    }));

  test("remove protected", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit, remove } = createEmitter<string>();

      const listener = (a: string) => captured.push(a);
      const unsub = listen(listener, true);

      remove(listener);

      emit("foo");
      expect(captured, "normal remove() shouldn't remove a protected listener").toEqual(["foo"]);

      unsub();

      emit("bar");
      expect(captured, "returned unsub func should remove a protected listener").toEqual(["foo"]);

      dispose();
    }));

  test("has()", () =>
    createRoot(dispose => {
      const { listen, has } = createEmitter<string>();

      const listener = () => {};
      expect(has(listener)).toBe(false);
      const unsub = listen(listener);
      expect(has(listener)).toBe(true);
      unsub();
      expect(has(listener)).toBe(false);

      dispose();
    }));

  test("config options", () =>
    createRoot(dispose => {
      let allowEmit = true;
      let allowRemove = false;

      const capturedBeforeEmit: any[] = [];

      const { listen, has, remove, emit } = createEmitter<string>({
        beforeEmit: a => capturedBeforeEmit.push(a),
        emitGuard: (emit, payload) => allowEmit && emit(payload),
        removeGuard: remove => allowRemove && remove()
      });
      const listener = () => {};

      let unsub = listen(listener);
      remove(listener);
      expect(has(listener)).toBe(true);
      unsub();
      expect(has(listener)).toBe(false);

      listen(listener);
      allowRemove = true;
      remove(listener);
      expect(has(listener)).toBe(false);

      emit("foo");
      expect(capturedBeforeEmit).toEqual(["foo"]);
      allowEmit = false;
      emit("bar");
      expect(capturedBeforeEmit).toEqual(["foo"]);

      dispose();
    }));
});
