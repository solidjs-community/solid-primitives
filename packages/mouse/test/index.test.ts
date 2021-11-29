import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import { createMousePosition, createMouseToElement } from "../src";

const cmp = suite("createMousePosition");

cmp("returns correct values", () =>
  createRoot(dispose => {
    const [{ x, y, sourceType }, { stop, start }] = createMousePosition();

    assert.type(x, "function");
    assert.is(x(), 0);
    assert.type(y, "function");
    assert.is(y(), 0);
    assert.type(sourceType, "function");
    assert.is(sourceType(), null);

    assert.type(stop, "function");
    assert.type(start, "function");
    dispose();
  })
);

cmp("initial values can be changed", () =>
  createRoot(dispose => {
    const [{ x, y }] = createMousePosition({
      initialValue: { x: 69, y: 420 }
    });
    assert.is(x(), 69);
    assert.is(y(), 420);
    dispose();
  })
);

cmp.run();

const cte = suite("createMouseToElement");

cte("returns correct values", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [{ x, y, width, height, top, left }, update] = createMouseToElement(el);

    assert.type(x, "function");
    assert.is(x(), 0);
    assert.type(y, "function");
    assert.is(y(), 0);
    assert.type(width, "function");
    assert.is(width(), 0);
    assert.type(height, "function");
    assert.is(height(), 0);
    assert.type(top, "function");
    assert.is(top(), 0);
    assert.type(left, "function");
    assert.is(left(), 0);

    assert.type(update, "function");
    dispose();
  })
);

cte("initial values can be changed", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [{ x, y, width, height, top, left }] = createMouseToElement(el, undefined, {
      initialValue: {
        x: 1,
        y: 2,
        width: 3,
        height: 4,
        top: 5,
        left: 6
      }
    });

    assert.is(x(), 1);
    assert.is(y(), 2);
    assert.is(width(), 3);
    assert.is(height(), 4);
    assert.is(top(), 5);
    assert.is(left(), 6);

    dispose();
  })
);

cte.run();
