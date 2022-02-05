import { push, sort } from "../src";
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

test.run();
