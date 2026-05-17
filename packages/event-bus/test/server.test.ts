import { describe, test, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createEventBus } from "../src/eventBus.js";
import { createEmitter } from "../src/emitter.js";
import { createEventStack } from "../src/eventStack.js";
import { createEventHub } from "../src/eventHub.js";

describe("API doesn't break in SSR", () => {
  test("createEventBus() - SSR", () =>
    createRoot(dispose => {
      const bus = createEventBus<string>();
      const cb = vi.fn();
      bus.listen(cb);
      bus.emit("foo");
      expect(cb).toBeCalledWith("foo");
      dispose();
    }));

  test("createEmitter() - SSR", () =>
    createRoot(dispose => {
      const emitter = createEmitter<{ a: number }>();
      const cb = vi.fn();
      emitter.on("a", cb);
      emitter.emit("a", 1);
      expect(cb).toBeCalledWith(1);
      dispose();
    }));

  test("createEventStack() - SSR", () =>
    createRoot(dispose => {
      const stack = createEventStack<{ text: string }>();
      expect(stack.value()).toEqual([]);
      dispose();
    }));

  test("createEventHub() - SSR", () =>
    createRoot(dispose => {
      const hub = createEventHub({
        busA: createEventBus<number>(),
        busB: createEventBus<string>(),
      });
      const cb = vi.fn();
      hub.on("busA", cb);
      hub.emit("busA", 42);
      expect(cb).toBeCalledWith(42);
      dispose();
    }));
});
