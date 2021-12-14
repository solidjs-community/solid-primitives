import { createPrimitiveTemplate } from "../src";
import { createComputed, createEffect, createRoot } from "solid-js";
import { createStore } from "solid-js/store";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const test = suite("createPrimitiveTemplate");

test("createPrimitiveTemplate return values", () =>
  createRoot(dispose => {
    const [value, setValue] = createPrimitiveTemplate(true);
    assert.is(value(), true, "initial value should be true");
    setValue(false);
    assert.is(value(), false, "value after change should be false");
    dispose();
  }));

test.run();
