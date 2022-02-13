import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createComputed, createRoot, createSignal } from "solid-js";
import { mapKey } from "../src";
import { update } from "@solid-primitives/immutable";

const el1 = { id: 1, value: "bread" };
const el2 = { id: 2, value: "milk" };
const el3 = { id: 3, value: "honey" };
const el4 = { id: 4, value: "chips" };

const testMap = suite("mapKey");

testMap("maps and returns all initial items", () =>
  createRoot(dispose => {
    const mapped = mapKey(
      () => [el1, el2, el3],
      v => v.id,
      v => ({ ...v(), key: v().id })
    );
    assert.is(mapped().length, 3);
    assert.is(mapped()[0].key, 1);
    assert.is(mapped()[1].key, 2);
    assert.is(mapped()[2].key, 3);

    dispose();
  })
);

testMap("cloning list should have no effect", () =>
  createRoot(dispose => {
    const [list, setList] = createSignal([el1, el2, el3]);
    let changes = 0;
    const mapped = mapKey(
      list,
      v => v.id,
      v => v().id
    );
    createComputed(() => mapped(), changes++);
    assert.equal(mapped(), [1, 2, 3]);
    assert.is(changes, 1);

    setList(p => p.slice());
    assert.equal(mapped(), [1, 2, 3]);
    assert.is(changes, 1);

    dispose();
  })
);

testMap("mapFn is reactive", () =>
  createRoot(dispose => {
    const [list, setList] = createSignal([el1, el2, el3]);
    let changes = 0;
    const mapped = mapKey(
      list,
      v => v.id,
      v => {
        const item = { value: v().value };
        createComputed(() => (item.value = v().value));
        return item;
      }
    );
    createComputed(() => mapped(), changes++);

    assert.equal(mapped(), [{ value: "bread" }, { value: "milk" }, { value: "honey" }]);
    assert.is(changes, 1);

    setList(p => update(p, 0, "value", "bananas"));
    assert.equal(mapped(), [{ value: "bananas" }, { value: "milk" }, { value: "honey" }]);
    assert.is(changes, 1);

    dispose();

    setList(p => update(p, 1, "value", "orange juice"));
    assert.equal(mapped(), [{ value: "bananas" }, { value: "milk" }, { value: "honey" }]);
    assert.is(changes, 1);
    assert.is(changes, 1);
  })
);

testMap("index is reactive", () =>
  createRoot(dispose => {
    const [list, setList] = createSignal([el1, el2, el3]);
    let changes = 0;
    let maprun = 0;
    const mapped = mapKey(
      list,
      v => v.id,
      (v, i) => {
        maprun++;
        const item = { i: i(), v: v().value };
        createComputed(() => (item.i = i()), (item.v = v().value));
        return item;
      }
    );
    createComputed(() => {
      mapped();
      changes++;
    });

    assert.equal(mapped(), [
      { i: 0, v: "bread" },
      { i: 1, v: "milk" },
      { i: 2, v: "honey" }
    ]);
    assert.is(changes, 1);
    assert.is(maprun, 3);

    setList(p => [el1, el3, el2]);
    assert.equal(mapped(), [
      { i: 0, v: "bread" },
      { i: 1, v: "honey" },
      { i: 2, v: "milk" }
    ]);
    assert.is(changes, 2);
    assert.is(maprun, 3);

    setList(p => [el1, el4, el3, el2]);
    assert.equal(mapped(), [
      { i: 0, v: "bread" },
      { i: 1, v: "chips" },
      { i: 2, v: "honey" },
      { i: 3, v: "milk" }
    ]);
    assert.is(changes, 3);
    assert.is(maprun, 4);

    dispose();
  })
);

testMap.run();
