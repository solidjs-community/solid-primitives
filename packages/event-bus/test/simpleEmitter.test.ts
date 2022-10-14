import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createSimpleEmitter } from "../src";

describe("createSimpleEmitter", () => {
  test("emitting and listening", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const [listen, emit] = createSimpleEmitter<string, number, boolean>();

      listen((...args) => captured.push(args));

      emit("foo", 1, true);
      expect(captured[0]).toEqual(["foo", 1, true]);

      emit("bar", 2, false);
      expect(captured[1]).toEqual(["bar", 2, false]);

      dispose();
    }));

  test("initial listeners", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const [, emit] = createSimpleEmitter<string>([a => captured.push(a)]);

      emit("foo");
      expect(captured).toEqual(["foo"]);

      emit("bar");
      expect(captured).toEqual(["foo", "bar"]);

      dispose();
    }));

  test("clear function", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const [listen, emit, clear] = createSimpleEmitter<string>();

      listen(a => captured.push(a));

      clear();

      emit("foo");
      expect(captured.length).toBe(0);

      dispose();
    }));

  test("clears on dispose", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const [listen, emit] = createSimpleEmitter<string>();

      listen(a => captured.push(a));

      dispose();

      emit("foo");
      expect(captured.length).toBe(0);
    }));
});
