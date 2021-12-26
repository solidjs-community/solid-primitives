import { createEventStack } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createEventStack");

test("return values", () =>
  createRoot(dispose => {
    const emitter = createEventStack();

    assert.type(emitter.clear, "function");
    assert.type(emitter.emit, "function");
    assert.type(emitter.has, "function");
    assert.type(emitter.listen, "function");
    assert.type(emitter.once, "function");
    assert.type(emitter.remove, "function");
    assert.type(emitter.stack, "function");
    assert.type(emitter.setStack, "function");
    assert.type(emitter.removeFromStack, "function");

    dispose();
  }));

test("emitting and listening", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    let capturedStack: any[] = [];
    let allowRemove = false;

    const { listen, emit, stack } = createEventStack<[string]>();

    listen((e, stack, remove) => {
      captured.push(e[0]);
      capturedStack = stack;
      if (allowRemove) remove();
    });

    emit(["foo"]);
    assert.is(captured[0], "foo");
    assert.is(capturedStack.length, 1);
    assert.is(stack().length, 1);

    emit(["bar"]);
    assert.is(captured[1], "bar");
    assert.is(capturedStack.length, 2);
    assert.is(stack().length, 2);

    allowRemove = true;
    emit(["baz"]);
    assert.is(captured[2], "baz");
    assert.is(capturedStack.length, 3);
    assert.is(stack().length, 2);

    dispose();
  }));

test("clear function", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit, clear } = createEventStack<{ text: string }>();

    listen(a => captured.push(a));

    clear();

    emit({ text: "foo" });
    assert.is(captured.length, 0);

    dispose();
  }));

test("clears on dispose", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit } = createEventStack<{ text: string }>();

    listen(a => captured.push(a));

    dispose();

    emit({ text: "foo" });
    assert.is(captured.length, 0);
  }));

test("once()", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { once, emit } = createEventStack<[string]>();

    once(a => captured.push(a));

    emit(["foo"]);
    assert.is(captured.length, 1, "first emit should work");

    emit(["bar"]);
    assert.is(captured.length, 1, "second emit shouldn't be captured");

    once(a => captured.push(a), true);
    emit(["foo"]);
    assert.is(captured.length, 2, "protected: first emit should work");

    emit(["bar"]);
    assert.is(captured.length, 2, "protected: second emit shouldn't be captured");

    dispose();
  }));

test("remove()", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit, remove } = createEventStack<[string]>();

    const listener = (a: [string]) => captured.push(a[0]);
    listen(listener);

    remove(listener);

    emit(["foo"]);
    assert.is(captured.length, 0);

    const unsub = listen(listener);
    unsub();

    emit(["bar"]);
    assert.is(captured.length, 0);

    dispose();
  }));

test("remove protected", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const { listen, emit, remove } = createEventStack<[string]>();

    const listener = (a: [string]) => captured.push(a[0]);
    const unsub = listen(listener, true);

    remove(listener);

    emit(["foo"]);
    assert.equal(captured, ["foo"], "normal remove() shouldn't remove a protected listener");

    unsub();

    emit(["bar"]);
    assert.equal(captured, ["foo"], "returned unsub func should remove a protected listener");

    dispose();
  }));

test("has()", () =>
  createRoot(dispose => {
    const { listen, has } = createEventStack<[string]>();

    const listener = () => {};
    assert.is(has(listener), false);
    const unsub = listen(listener);
    assert.is(has(listener), true);
    unsub();
    assert.is(has(listener), false);

    dispose();
  }));

test("stack", () =>
  createRoot(dispose => {
    const { emit, stack, removeFromStack, setStack } = createEventStack<[string]>();

    assert.equal(stack(), []);

    emit(["foo"]);
    assert.equal(stack(), [["foo"]]);

    const x: [string] = ["bar"];

    emit(x);
    assert.equal(stack(), [["foo"], ["bar"]]);

    assert.is(removeFromStack(x), true);
    assert.is(removeFromStack(["hello"]), false);
    assert.is(stack().length, 1);

    const y: [string][] = [["0"], ["1"]];
    setStack(y);
    assert.equal(stack(), y);

    dispose();
  }));

test("config options", () =>
  createRoot(dispose => {
    let allowEmit = true;
    let allowRemove = false;

    const capturedBeforeEmit: { text: string }[] = [];

    const { listen, has, remove, emit, stack } = createEventStack<string, { text: string }>({
      beforeEmit: a => capturedBeforeEmit.push(a),
      emitGuard: (emit, ...payload) => allowEmit && emit(...payload),
      removeGuard: remove => allowRemove && remove(),
      toValue: e => ({ text: e })
    });
    const listener = () => {};

    let unsub = listen(listener);
    remove(listener);
    assert.is(has(listener), true, "removing should fail");
    unsub();
    assert.is(has(listener), false);

    listen(listener);
    allowRemove = true;
    remove(listener);
    assert.is(has(listener), false);

    emit("foo");
    assert.equal(capturedBeforeEmit, [{ text: "foo" }]);
    allowEmit = false;
    emit("bar");
    assert.equal(capturedBeforeEmit, [{ text: "foo" }]);

    assert.equal(stack(), [{ text: "foo" }]);

    dispose();
  }));

test.run();
