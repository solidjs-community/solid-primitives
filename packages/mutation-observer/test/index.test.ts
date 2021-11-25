import { MutationObserver, instances } from "./setup";
import { createMutationObserver, mutationObserver } from "../src";
import { createRoot, createSignal } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";

test("returns correct values", () =>
  createRoot(dispose => {
    const parent = document.createElement("div");
    const [add, { start, stop, instance, isSupported }] = createMutationObserver(
      parent,
      { childList: true },
      e => {}
    );

    assert.type(add, "function", "add should be a function");
    assert.type(start, "function", "start should be a function");
    assert.type(stop, "function", "stop should be a function");
    assert.instance(
      instance,
      MutationObserver,
      "instance should be a instance of MutationObserver"
    );
    assert.type(isSupported, "boolean", "isSupported should be a boolean");

    dispose();
  }));

test("creates a new MutationObserver instance", () =>
  createRoot(dispose => {
    const prevLength = instances.length;
    const parent = document.createElement("div");
    const [, { instance }] = createMutationObserver(parent, { childList: true }, e => {});

    assert.is(instances.length, prevLength + 1, "new instance should be created");
    assert.is(instance, instances[prevLength], "new instance should match returned");

    dispose();
  }));

test("returns correct values", () => createRoot(dispose => {}));

test.run();
