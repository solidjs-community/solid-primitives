import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createSignal } from "solid-js";
import {
  elements,
  getAddedItems,
  getChangedItems,
  getRemovedItems,
  mapRemoved,
  refs
} from "../src";
import { push, remove, removeItems } from "@solid-primitives/immutable";

const el1 = document.createElement("div");
const el2 = document.createElement("span");
const el3 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const el4 = document.createElement("h1");
const el5 = document.createElement("h1");

const testGetChanges = suite("get changes helpers");

testGetChanges("getAddedItems", () => {
  const from = Array.from({ length: 5 }, () => new Date());
  const add = Array.from({ length: 2 }, () => new Date());
  const to = [from[0], from[1], add[0], from[3], add[1]];
  const added = getAddedItems(from, to);
  assert.equal(added, add);
});

testGetChanges("getRemovedItems", () => {
  const from = Array.from({ length: 5 }, () => new Date());
  const add = Array.from({ length: 2 }, () => new Date());
  const to = [from[0], from[1], add[0], from[3], add[1]];
  const removed = getRemovedItems(from, to);
  assert.equal(removed, [from[2], from[4]]);
});

testGetChanges("getChangedItems", () => {
  const from = Array.from({ length: 5 }, () => new Date());
  const add = Array.from({ length: 2 }, () => new Date());
  const to = [from[0], from[1], add[0], from[3], add[1]];
  const [added, removed] = getChangedItems(from, to);
  assert.equal(removed, [from[2], from[4]]);
  assert.equal(added, add);
});

testGetChanges.run();

const testElements = suite("elements()");

testElements("get a signal of elements array", () =>
  createRoot(dispose => {
    const _arr = [123456, undefined, el2, NaN, el1, null, "HELLO", el3, el4, [1, 2, 3]];
    const [arr, setArr] = createSignal(_arr);
    const els = elements(arr);

    assert.is(els().length, 4);
    els().forEach(el => {
      assert.instance(el, Element);
    });

    setArr([]);
    assert.is(els().length, 0);

    const htmlEls = elements(arr, HTMLElement);
    assert.is(htmlEls().length, 0);

    setArr(_arr);
    assert.is(htmlEls().length, 3);
    htmlEls().forEach(el => {
      assert.instance(el, HTMLElement);
    });

    dispose();
  })
);

testElements.run();

const testRefs = suite("refs()");

testRefs("returned signals reflect changes to source", () => {
  const _source = [undefined, el2, el1, "HELLO", el3];
  const [source, setSource] = createSignal(_source);

  const [els, added, removed] = refs(source);
  assert.equal(els(), [el2, el1, el3]);
  assert.equal(added(), [el2, el1, el3]);
  assert.equal(removed(), []);

  setSource(p => [...p, el4]);
  assert.equal(els(), [el2, el1, el3, el4]);
  assert.equal(added(), [el4]);
  assert.equal(removed(), []);

  setSource(p => removeItems(p, el1, el2, undefined));
  assert.equal(els(), [el3, el4], "3 1");
  assert.equal(added(), [], "3 2");
  assert.equal(removed(), [el2, el1], "3 3");
});

testRefs.run();

const testMapRemoved = suite("mapRemoved()");

testMapRemoved("mapFn get's called on each item remove", () =>
  createRoot(dispose => {
    const _source = [el2, el1, el2, el3, el4];
    const [source, setSource] = createSignal(_source);

    const captured_els: Element[] = [];
    mapRemoved(source, el => {
      captured_els.push(el);
    });
    assert.is(captured_els.length, 0);

    setSource(p => remove(p, el3));
    assert.equal(captured_els, [el3]);

    setSource(p => remove(p, el2));
    assert.equal(captured_els, [el3]);

    setSource(p => removeItems(p, el2, el1));
    assert.equal(captured_els, [el3, el1, el2]);

    dispose();
  })
);

testMapRemoved("returns combined array", () =>
  createRoot(dispose => {
    const _source = [el1, el2, el3, el5];
    const [source, setSource] = createSignal(_source);

    let returns = true;
    const res = mapRemoved(source, el => (returns ? () => el : undefined));

    setSource(p => remove(p, el3));
    assert.equal(res(), [el1, el2, el3, el5]);

    returns = false;
    setSource(p => remove(p, el2));
    assert.equal(res(), [el1, el3, el5]);

    setSource(p => push(p, el4));
    assert.equal(res(), [el1, el3, el5, el4]);

    setSource(() => [el4, el5, el1]);
    assert.equal(res(), [el4, el3, el5, el1]);

    dispose();
  })
);

testMapRemoved("removeing saved element", () =>
  createRoot(dispose => {
    const _source = [el1, el2, el3, el5];
    const [source, setSource] = createSignal(_source);
    const fns: VoidFunction[] = [];

    const res = mapRemoved<Element | undefined>(source, ref => {
      const [el, setEl] = createSignal<Element | undefined>(ref);
      fns.push(() => setEl(undefined));
      return el;
    });

    setSource(p => remove(p, el3));
    assert.equal(res(), [el1, el2, el3, el5]);

    fns.forEach(fn => fn());
    assert.equal(res(), [el1, el2, el5]);

    setSource(p => removeItems(p, el2, el1));
    assert.equal(res(), [el1, el2, el5]);

    fns.forEach(fn => fn());
    assert.equal(res(), [el5]);

    dispose();
  })
);

testMapRemoved("index signal", () =>
  createRoot(dispose => {
    const _source = [el1, el2, el3, el5];
    const [source, setSource] = createSignal(_source);
    const saved = new Map<Element, () => number>();

    let returns = true;
    mapRemoved(source, (el, index) => {
      saved.set(el, index);
      return returns ? () => el : undefined;
    });

    setSource(p => remove(p, el3));
    assert.is(saved.get(el3)!(), 2);

    returns = false;
    setSource(p => remove(p, el2));
    assert.is(saved.get(el3)!(), 1);

    setSource(p => [el4, ...p]);
    assert.is(saved.get(el3)!(), 2);

    setSource([]);
    assert.is(saved.get(el3)!(), 0);

    setSource([el1, el2, el4, el5]);
    assert.is(saved.get(el3)!(), 0);

    dispose();
  })
);

testMapRemoved.run();
