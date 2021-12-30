import { createEventBus } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createComputed } from "solid-js";

const test = suite("createEventBus");

test("return values", () => {
  const emitter = createEventBus();

  assert.type(emitter.clear, "function");
  assert.type(emitter.emit, "function");
  assert.type(emitter.has, "function");
  assert.type(emitter.listen, "function");
  assert.type(emitter.once, "function");
  assert.type(emitter.remove, "function");
  assert.type(emitter.value, "function");
});

test("emitting and listening", () => {
  const captured: any[] = [];
  const { listen, emit } = createEventBus<string>();

  listen((e, prev) => captured.push([e, prev]));

  emit("foo");
  assert.equal(captured[0], ["foo", undefined]);

  emit("bar");
  assert.equal(captured[1], ["bar", "foo"]);
});

test("clear function", () => {
  const captured: any[] = [];
  const { listen, emit, clear } = createEventBus<string>();

  listen(a => captured.push(a));

  clear();

  emit("foo");
  assert.is(captured.length, 0);
});

test("clears on dispose", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit } = createEventBus<string>();

    listen(a => captured.push(a));

    dispose();

    emit("foo");
    assert.is(captured.length, 0);
  }));

test("once()", () => {
  const captured: any[] = [];
  const { once, emit } = createEventBus<string>();

  once(a => captured.push(a));

  emit("foo");
  assert.is(captured.length, 1, "first emit should work");

  emit("bar");
  assert.is(captured.length, 1, "second emit shouldn't be captured");

  once(a => captured.push(a), true);
  emit("foo");
  assert.is(captured.length, 2, "protected: first emit should work");

  emit("bar");
  assert.is(captured.length, 2, "protected: second emit shouldn't be captured");
});

test("remove()", () => {
  const captured: any[] = [];
  const { listen, emit, remove } = createEventBus<string>();

  const listener = (a: string) => captured.push(a);
  listen(listener);

  remove(listener);

  emit("foo");
  assert.equal(captured, []);

  const unsub = listen(listener);
  unsub();

  emit("bar");
  assert.equal(captured, []);
});

test("remove protected", () => {
  const captured: any[] = [];
  const { listen, emit, remove } = createEventBus<string>();

  const listener = (a: string) => captured.push(a);
  const unsub = listen(listener, true);

  remove(listener);

  emit("foo");
  assert.equal(captured, ["foo"], "normal remove() shouldn't remove a protected listener");

  unsub();

  emit("bar");
  assert.equal(captured, ["foo"], "returned unsub func should remove a protected listener");
});

test("has()", () => {
  const { listen, has } = createEventBus<string>();

  const listener = () => {};
  assert.is(has(listener), false);
  const unsub = listen(listener);
  assert.is(has(listener), true);
  unsub();
  assert.is(has(listener), false);
});

test("last value", () => {
  const { emit, value } = createEventBus<string>();

  assert.is(value(), undefined);

  emit("foo");
  assert.is(value(), "foo");

  emit("bar");
  assert.is(value(), "bar");
});

test("value is reactive", () =>
  createRoot(dispose => {
    const { emit, value } = createEventBus<string>();
    const captured: any[] = [];
    createComputed(() => {
      captured.push(value());
    });

    assert.equal(captured, [undefined]);

    emit("foo");
    assert.equal(captured, [undefined, "foo"]);

    emit("bar");
    assert.equal(captured, [undefined, "foo", "bar"]);

    dispose();
  }));

test("config options", () =>
  createRoot(dispose => {
    let allowEmit = true;
    let allowRemove = false;

    const capturedBeforeEmit: any[] = [];

    const { listen, has, remove, emit, value } = createEventBus<string>({
      beforeEmit: a => capturedBeforeEmit.push(a),
      emitGuard: (emit, ...payload) => allowEmit && emit(...payload),
      removeGuard: remove => allowRemove && remove(),
      value: "initial"
    });
    const listener = () => {};

    assert.is(value(), "initial");

    let unsub = listen(listener);
    remove(listener);
    assert.is(has(listener), true);
    unsub();
    assert.is(has(listener), false);

    listen(listener);
    allowRemove = true;
    remove(listener);
    assert.is(has(listener), false);

    emit("foo");
    assert.equal(capturedBeforeEmit, ["foo"]);
    allowEmit = false;
    emit("bar");
    assert.equal(capturedBeforeEmit, ["foo"]);

    dispose();
  }));

test.run();
