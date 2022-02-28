import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createSignal } from "solid-js";
import { tuple } from "@solid-primitives/utils";
import { spread } from "../src";

const testSpread = suite("spread");

testSpread("spread", () =>
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
  })
);

testSpread.run();
