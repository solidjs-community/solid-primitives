import { createEmitter, createEventBus, createEventHub, createEventStack } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createEventHub");

const syncTest = (name: string, fn: (dispose: () => void) => void) =>
  test(name, () =>
    createRoot(dispose => {
      fn(dispose);
      dispose();
    })
  );

syncTest("returned values", () => {
  const hub = createEventHub({
    busA: createEmitter<void>(),
    busB: createEventBus<string>(),
    busC: createEventStack<{ text: string }>()
  });

  assert.type(hub.busA, "object");
  assert.type(hub.busA.emit, "function");
  assert.type(hub.busB, "object");
  assert.type(hub.busB.emit, "function");
  assert.type(hub.busC, "object");
  assert.type(hub.busC.emit, "function");

  assert.type(hub.clear, "function");
  assert.type(hub.clearAll, "function");
  assert.type(hub.emit, "function");
  assert.type(hub.clearGlobal, "function");
  assert.type(hub.listen, "function");
  assert.type(hub.remove, "function");
  assert.type(hub.on, "function");
  assert.type(hub.once, "function");
  assert.type(hub.off, "function");
  assert.type(hub.store, "object");
});

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

  assert.equal(capturedA, [0, 1]);
  assert.equal(capturedB, ["foo", "bar"]);
  assert.equal(capturedAny, [
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

  assert.is(capturedA.length, 0);
  assert.equal(capturedB, ["foo"]);
  assert.equal(capturedAny, [
    ["busA", 0],
    ["busB", "foo"]
  ]);

  hub.clearAll();

  hub.emit("busA", 1);
  hub.emit("busB", "bar");

  assert.is(capturedA.length, 0);
  assert.is(capturedB.length, 1);
  assert.equal(capturedAny, [
    ["busA", 0],
    ["busB", "foo"],
    ["busA", 1],
    ["busB", "bar"]
  ]);

  hub.clearGlobal();

  hub.emit("busA", 2);
  hub.emit("busB", "baz");

  assert.is(capturedA.length, 0);
  assert.is(capturedB.length, 1);
  assert.is(capturedAny.length, 4);
});

syncTest("accessing values", () => {
  const hub = createEventHub({
    busA: createEmitter<void>(),
    busB: createEventBus<string>(),
    busC: createEventStack<{ text: string }>()
  });

  assert.is(hub.store.busA, undefined);
  assert.is(hub.store.busB, undefined);
  assert.instance(hub.store.busC, Array);
  assert.is(hub.store.busC.length, 0);

  hub.emit("busA");
  hub.emit("busB", "foo");
  hub.emit("busC", { text: "bar" });

  assert.is(hub.store.busA, undefined);
  assert.is(hub.store.busB, "foo");
  assert.equal(hub.store.busC, [{ text: "bar" }]);
});

test.run();
