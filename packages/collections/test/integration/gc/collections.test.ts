import assert from "node:assert/strict";
import { test } from "node:test";
import { createRoot, createSignal, flush } from "solid-js";
import { createReactiveMap, createReactiveSet } from "../../../src/index.js";

async function collect() {
  for (let i = 0; i < 12; i++) {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    flush();
    globalThis.gc!();
  }
}
function emptyCompute(): void {}

// Keep fixture callbacks and disposer closures out of the allocation scope:
// the fixture must not retain the very input whose lifetime it measures.
function fixture(kind: "map" | "set" | "loading", operation: "delete" | "clear") {
  const key = {},
    value = { key };
  const input = kind === "set" ? new Set([key]) : new Map([[key, value]]);
  const collection = createRoot(() =>
    kind === "set"
      ? createReactiveSet(input as Set<object>)
      : kind === "loading"
        ? createReactiveMap<object, object>(emptyCompute, {
            loadingValue: input as Map<object, object>,
          })
        : createReactiveMap(input as Map<object, object>),
  );
  if (operation === "clear") collection.clear();
  else collection.delete(key);
  flush();
  return {
    collection,
    key: new WeakRef(key),
    value: new WeakRef(value),
    input: new WeakRef(input),
  };
}

for (const kind of ["map", "set", "loading"] as const) {
  for (const operation of ["delete", "clear"] as const) {
    test(`${kind} releases its input and removed entries after ${operation}`, async () => {
      const f = fixture(kind, operation);
      await collect();
      assert.equal(f.collection.size, 0);
      assert.equal(f.input.deref(), undefined);
      assert.equal(f.key.deref(), undefined);
      assert.equal(f.value.deref(), undefined);
    });
  }
}

function cursorFixture(kind: "keys" | "values" | "entries") {
  const key = {},
    value = { key };
  const map = createRoot(() => createReactiveMap<object | string, object | number>());
  map.set("first", 1).set(key, value);
  flush();
  const cursor = map[kind]();
  cursor.next();
  map.clear();
  flush();
  return { map, cursor, key: new WeakRef(key), value: new WeakRef(value) };
}
for (const kind of ["keys", "values", "entries"] as const) {
  test(`a paused ${kind} cursor does not retain removed unvisited entries`, async () => {
    const f = cursorFixture(kind);
    await collect();
    assert.equal(f.key.deref(), undefined);
    assert.equal(f.value.deref(), undefined);
    assert.equal(f.map.size, 0);
    assert.equal(f.cursor.next().done, true);
  });
}

function replacementFixture(optimistic: boolean) {
  const key = {},
    value = { key },
    input = new Map([[key, value]]);
  const [source, update] = createSignal(input);
  const map = createRoot(() => createReactiveMap(source, { optimistic }));
  assert.equal(map.get(key), value);
  update(new Map());
  flush();
  return { map, key: new WeakRef(key), value: new WeakRef(value), input: new WeakRef(input) };
}
for (const optimistic of [false, true]) {
  test(`derived replacement releases obsolete input, keys, and values, optimistic=${optimistic}`, async () => {
    const f = replacementFixture(optimistic);
    await collect();
    assert.equal(f.map.size, 0);
    assert.equal(f.input.deref(), undefined);
    assert.equal(f.key.deref(), undefined);
    assert.equal(f.value.deref(), undefined);
  });
}
