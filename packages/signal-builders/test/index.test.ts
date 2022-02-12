import { filterInstance, filterOutInstance, push, sort, spread } from "../src";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { compare, tuple } from "@solid-primitives/utils";

const test = suite("*");

test("", () =>
  createRoot(dispose => {
    const [list, setList] = createSignal([4, 3, 2, 1]);
    const [item, setItem] = createSignal(0);
    const res = sort(push(list, item), compare);
    assert.equal(res(), [0, 1, 2, 3, 4]);
    setList([1, 2, 3, 5, 4]);
    setItem(1);
    assert.equal(res(), [1, 1, 2, 3, 4, 5]);
    dispose();
  }));

test("spread", () =>
  createRoot(dispose => {
    const [numbers, setNumbers] = createSignal(tuple([1, 2, 3]));
    const [first, second, last] = spread(numbers);
    assert.is(first(), 1);
    assert.is(second(), 2);
    assert.is(last(), 3);
    setNumbers([5, 6, 7]);
    assert.is(first(), 5);
    assert.is(second(), 6);
    assert.is(last(), 7);
    dispose();
  }));

test("filter instances", () =>
  createRoot(dispose => {
    const num = 12345;
    const string = "hello";
    const el = document.createElement("div");
    const svg = document.createElement("svg");
    const list = [num, string, el, svg, string, null, undefined, NaN];
    const copy = [num, string, el, svg, string, null, undefined, NaN];

    const a = filterInstance(() => list, Element, Number);
    assert.equal(a(), [num, el, svg]);
    const b = filterOutInstance(() => list, Element, Number);
    assert.equal(b(), [string, string]);
    assert.equal(list, copy, "nonmutable");
    dispose();
  }));

test.run();
