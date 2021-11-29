import { createRoot, createSignal } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";

import { createMousePosition } from "../src/";

test("returns correct values", () =>
  createRoot(dispose => {
    const [{ x, y, sourceType }, { stop, start }] = createMousePosition();

    assert.type(x, "function");
    assert.type(x(), "number");
    assert.type(y, "function");
    assert.type(y(), "number");
  }));

test("", () => createRoot(dispose => {}));

test.run();
