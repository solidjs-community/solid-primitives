import { createEmitter } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createEmitter");

test("return values", () =>
  createRoot(dispose => {
    const emitter = createEmitter();

    assert.type(emitter.clear, "function");
    assert.type(emitter.emit, "function");
    assert.type(emitter.has, "function");
    assert.type(emitter.listen, "function");
    assert.type(emitter.remove, "function");

    dispose();
  }));

test("emitting and listening", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit } = createEmitter<string, number, boolean>();

    listen((...args) => captured.push(args));

    emit("foo", 1, true);
    assert.equal(captured[0], ["foo", 1, true]);

    emit("bar", 2, false);
    assert.equal(captured[1], ["bar", 2, false]);

    dispose();
  }));

test("clear function", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit, clear } = createEmitter<string>();

    listen(a => captured.push(a));

    clear();

    emit("foo");
    assert.is(captured.length, 0);

    dispose();
  }));

test("clears on dispose", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit } = createEmitter<string>();

    listen(a => captured.push(a));

    dispose();

    emit("foo");
    assert.is(captured.length, 0);
  }));

test("remove()", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit, remove } = createEmitter<string>();

    const listener = (a: string) => captured.push(a);
    listen(listener);

    remove(listener);

    emit("foo");
    assert.equal(captured, []);

    const unsub = listen(listener);
    unsub();

    emit("bar");
    assert.equal(captured, []);

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
    assert.equal(captured, ["foo"], "normal remove() shouldn't remove a protected listener");

    unsub();

    emit("bar");
    assert.equal(captured, ["foo"], "returned unsub func should remove a protected listener");

    dispose();
  }));

test("has()", () =>
  createRoot(dispose => {
    const { listen, has } = createEmitter<string>();

    const listener = () => {};
    assert.is(has(listener), false);
    const unsub = listen(listener);
    assert.is(has(listener), true);
    unsub();
    assert.is(has(listener), false);

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
