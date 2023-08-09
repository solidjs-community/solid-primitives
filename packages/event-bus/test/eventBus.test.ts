import { createEventBus } from "../src/index.js";
import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";

describe("createEventBus", () => {
  test("emitting and listening", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit } = createEventBus<string>();

      listen((...args) => captured.push(args));

      emit("foo");
      expect(captured[0]).toEqual(["foo"]);

      emit("bar");
      expect(captured[1]).toEqual(["bar"]);

      dispose();
    }));

  test("clear function", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit, clear } = createEventBus<string>();

      listen(a => captured.push(a));

      clear();

      emit("foo");
      expect(captured.length).toBe(0);

      dispose();
    }));

  test("clears on dispose", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit } = createEventBus<string>();

      listen(a => captured.push(a));

      dispose();

      emit("foo");
      expect(captured.length).toBe(0);
    }));
});
