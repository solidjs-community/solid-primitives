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

test("single initial element is observed", () =>
  createRoot(dispose => {
    const config = { childList: true };
    const parent = document.createElement("div");

    const [, { instance, start, stop }] = createMutationObserver(parent, config, e => {});
    start();

    assert.equal(
      (instance as MutationObserver).records[0],
      [parent, config],
      "single initial node should be added as record"
    );

    stop();
    assert.equal(
      (instance as MutationObserver).records.length,
      0,
      "records should have been cleared after stop()"
    );

    dispose();
  }));

test("initial elements are being observed", () =>
  createRoot(dispose => {
    const config = { childList: true };

    const parent = document.createElement("div"),
      parent1 = document.createElement("div"),
      parent2 = document.createElement("div");

    const [, { instance, start, stop }] = createMutationObserver(
      [parent, parent1, parent2],
      config,
      e => {}
    );
    start();

    assert.equal(
      (instance as MutationObserver).records,
      [
        [parent, config],
        [parent1, config],
        [parent2, config]
      ],
      "initial nodes should be added as records"
    );

    stop();
    assert.equal(
      (instance as MutationObserver).records.length,
      0,
      "records should have been cleared after stop()"
    );

    dispose();
  }));

test("initial elements with individual configs", () =>
  createRoot(dispose => {
    const config = { childList: true },
      config1 = {},
      config2 = { attributes: true };

    const parent = document.createElement("div"),
      parent1 = document.createElement("div"),
      parent2 = document.createElement("div");

    const [, { instance, start, stop }] = createMutationObserver(
      [
        [parent, config],
        [parent1, config1],
        [parent2, config2]
      ],
      e => {}
    );
    start();

    assert.equal(
      (instance as MutationObserver).records,
      [
        [parent, config],
        [parent1, config1],
        [parent2, config2]
      ],
      "initial nodes should be added with their individual configs"
    );

    stop();
    assert.equal(
      (instance as MutationObserver).records.length,
      0,
      "records should have been cleared after stop()"
    );

    dispose();
  }));

test("observe method", () =>
  createRoot(dispose => {
    const config = { childList: true },
      config1 = {},
      config2 = { attributes: true };

    const parent = document.createElement("div"),
      parent1 = document.createElement("div"),
      parent2 = document.createElement("div"),
      parent3 = document.createElement("div");

    const [add, { instance, start, stop }] = createMutationObserver(parent, config, e => {});
    start();
    assert.equal(
      (instance as MutationObserver).records[0],
      [parent, config],
      "initial node should be added"
    );

    add(parent1, config1);
    assert.equal(
      (instance as MutationObserver).records[1],
      [parent1, config1],
      "node should be added with an individual config"
    );

    add(parent2);
    assert.equal(
      (instance as MutationObserver).records[2],
      [parent2, config],
      "node should be added with the default config"
    );

    add(parent3, () => config2);
    assert.equal(
      (instance as MutationObserver).records[3],
      [parent3, config2],
      "add() should work as a directive"
    );

    stop();
    assert.equal(
      (instance as MutationObserver).records.length,
      0,
      "records should have been cleared after stop()"
    );

    dispose();
  }));

test("standalone mutationObserver directive", () =>
  createRoot(dispose => {
    const config = { childList: true };
    const parent = document.createElement("div");

    mutationObserver(parent, () => [config, () => {}]);

    assert.equal(instances[instances.length - 1].records, [[parent, config]]);

    dispose();
  }));

test.run();
