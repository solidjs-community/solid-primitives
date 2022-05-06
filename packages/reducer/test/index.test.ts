import { createReducer } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createReducer");

test("reducer works", () =>
  createRoot(dispose => {
    const initialValue = 1;
    const numberOfDoubles = 3;

    const [counter, doubleCounter] = createReducer(counter => counter * 2, initialValue);

    let expectedCounter = initialValue;

    for (let i = 0; i < numberOfDoubles; i++) {
      doubleCounter();
      expectedCounter *= 2;
    }

    assert.equal(counter(), expectedCounter);

    dispose();
  }));

test.run();
