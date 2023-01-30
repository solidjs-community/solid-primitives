import { createEventBus } from "../src";
import { createRoot } from "solid-js";
import { describe, test, expect, vi } from "vitest";

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

  test("config options", () =>
    createRoot(dispose => {
      let allowEmit = true;

      const { listen, emit } = createEventBus<string>({
        emitGuard: (emit, payload) => allowEmit && emit(payload)
      });
      const listener = vi.fn();

      listen(listener);

      emit("foo");
      allowEmit = false;
      emit("bar");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("foo");

      dispose();
    }));
});
