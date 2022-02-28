import { filterInstance, filterOutInstance, push, sort, template } from "../src";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { compare } from "@solid-primitives/utils";

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

test("teamplate", () =>
  createRoot(dispose => {
    const [a, setA] = createSignal("Hello");
    const [b, setB] = createSignal("World");
    const result = template`${a} ${b}!!!`;
    assert.is(result(), "Hello World!!!");

    setB("Solid");
    assert.is(result(), "Hello Solid!!!");

    dispose();
  }));

test.run();
