import { createSimpleEmitter } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createSimpleEmitter");

test("return values", () =>
  createRoot(dispose => {
    const [listen, emit, clear] = createSimpleEmitter();
    assert.type(listen, "function", "listen should be a function");
    assert.type(emit, "function", "emit should be a function");
    assert.type(clear, "function", "clear should be a function");
    dispose();
  }));

test("emitting and listening", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const [listen, emit] = createSimpleEmitter<string, number, boolean>();

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
    const [listen, emit, clear] = createSimpleEmitter<string>();

    listen(a => captured.push(a));

    clear();

    emit("foo");
    assert.is(captured.length, 0);

    dispose();
  }));

test("clears on dispose", () =>
  createRoot(dispose => {
    const captured: any[] = [];
    const [listen, emit] = createSimpleEmitter<string>();

    listen(a => captured.push(a));

    dispose();

    emit("foo");
    assert.is(captured.length, 0);
  }));

test.run();
