import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createEmitter, createEventBus, createEventHub, createEventStack } from "../src";

const syncTest = (name: string, fn: (dispose: () => void) => void) =>
  test(name, () =>
    createRoot(dispose => {
      fn(dispose);
      dispose();
    })
  );

describe("createEventHub", () => {
  syncTest("listening and emiting", () => {
    const capturedA: number[] = [];
    const capturedB: string[] = [];
    const capturedAny: [string, number | string][] = [];

    const hub = createEventHub({
      busA: createEmitter<number>(),
      busB: createEventBus<string>()
    });

    hub.on("busA", e => capturedA.push(e));
    hub.on("busB", e => capturedB.push(e));
    hub.listen((name, [e]) => capturedAny.push([name, e]));

    hub.emit("busA", 0);
    hub.busA.emit(1);
    hub.emit("busB", "foo");
    hub.busB.emit("bar");

    expect(capturedA).toEqual([0, 1]);
    expect(capturedB).toEqual(["foo", "bar"]);
    expect(capturedAny).toEqual([
      ["busA", 0],
      ["busA", 1],
      ["busB", "foo"],
      ["busB", "bar"]
    ]);
  });

  syncTest("clearing listeners", () => {
    const capturedA: number[] = [];
    const capturedB: string[] = [];
    const capturedAny: [string, number | string][] = [];

    const hub = createEventHub({
      busA: createEmitter<number>(),
      busB: createEventBus<string>()
    });

    hub.on("busA", e => capturedA.push(e));
    hub.on("busB", e => capturedB.push(e));
    hub.listen((name, [e]) => capturedAny.push([name, e]));

    hub.clear("busA");

    hub.emit("busA", 0);
    hub.emit("busB", "foo");

    expect(capturedA.length).toBe(0);
    expect(capturedB).toEqual(["foo"]);
    expect(capturedAny).toEqual([
      ["busA", 0],
      ["busB", "foo"]
    ]);

    hub.clearAll();

    hub.emit("busA", 1);
    hub.emit("busB", "bar");

    expect(capturedA.length).toBe(0);
    expect(capturedB.length).toBe(1);
    expect(capturedAny).toEqual([
      ["busA", 0],
      ["busB", "foo"],
      ["busA", 1],
      ["busB", "bar"]
    ]);

    hub.clearGlobal();

    hub.emit("busA", 2);
    hub.emit("busB", "baz");

    expect(capturedA.length).toBe(0);
    expect(capturedB.length).toBe(1);
    expect(capturedAny.length).toBe(4);
  });

  syncTest("accessing values", () => {
    const hub = createEventHub({
      busA: createEmitter<void>(),
      busB: createEventBus<string>(),
      busC: createEventStack<{ text: string }>()
    });

    expect(hub.store.busA).toBe(undefined);
    expect(hub.store.busB).toBe(undefined);
    expect(hub.store.busC).instanceOf(Array);
    expect(hub.store.busC.length).toBe(0);

    hub.emit("busA");
    hub.emit("busB", "foo");
    hub.emit("busC", { text: "bar" });

    expect(hub.store.busA).toBe(undefined);
    expect(hub.store.busB).toBe("foo");
    expect(hub.store.busC).toEqual([{ text: "bar" }]);
  });
});
