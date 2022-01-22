import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import {
  createMouseInElement,
  createMouseOnScreen,
  createMousePosition,
  createMouseToElement
} from "../src";

const mp = suite("createMousePosition");

mp("returns correct values", () =>
  createRoot(dispose => {
    const [{ x, y, sourceType }, stop] = createMousePosition();

    assert.type(x, "function");
    assert.is(x(), 0);
    assert.type(y, "function");
    assert.is(y(), 0);
    assert.type(sourceType, "function");
    assert.is(sourceType(), null);

    assert.type(stop, "function");
    dispose();
  })
);

mp("initial values can be changed", () =>
  createRoot(dispose => {
    const [{ x, y }] = createMousePosition({
      initialValue: { x: 69, y: 420 }
    });
    assert.is(x(), 69);
    assert.is(y(), 420);
    dispose();
  })
);

mp.run();

const mte = suite("createMouseToElement");

mte("returns correct values", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [{ x, y, width, height, top, left, isInside }, update] = createMouseToElement(el);

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
    assert.type(isInside, "function");
    // isInside is calculated with position and element bounds,
    // so x is greater or equal to 0
    assert.is(isInside(), true);

    assert.type(update, "function");
    dispose();
  })
);

mte("initial values can be changed", () =>
  createRoot(dispose => {
    const [{ x, y, width, height, top, left, isInside }] = createMouseToElement(
      // passed target must behave like an ref (initially undefined) for initial values to matter
      () => undefined,
      undefined,
      {
        initialValue: {
          x: -1,
          y: 2,
          width: 3,
          height: 4,
          top: 5,
          left: 6
        }
      }
    );

    assert.is(x(), -1);
    assert.is(y(), 2);
    assert.is(width(), 3);
    assert.is(height(), 4);
    assert.is(top(), 5);
    assert.is(left(), 6);
    assert.is(isInside(), false, "x is smaller than 0");

    dispose();
  })
);

mte.run();

const mie = suite("createMouseInElement");

mie("returns correct values", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [{ x, y, isInside }, stop] = createMouseInElement(el);

    assert.type(x, "function");
    assert.is(x(), 0);
    assert.type(y, "function");
    assert.is(y(), 0);
    assert.type(isInside, "function");
    // isInside is captured by mouseenter and mouseleave events
    // none of these happened yet, so it defaults to false
    assert.is(isInside(), false);

    assert.type(stop, "function");
    dispose();
  })
);

mie("initial values can be changed", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [{ x, y }] = createMouseInElement(el, {
      initialValue: {
        x: 69,
        y: 420
      }
    });

    assert.is(x(), 69);
    assert.is(y(), 420);

    dispose();
  })
);

mie.run();

const mos = suite("createMouseOnScreen");

mos("returns correct values", () =>
  createRoot(dispose => {
    const [onScreen, stop] = createMouseOnScreen();

    assert.type(onScreen, "function");
    assert.is(onScreen(), false);

    assert.type(stop, "function");
    dispose();
  })
);

mos("initial value can be changed", () =>
  createRoot(dispose => {
    const [onScreen] = createMouseOnScreen(true);
    assert.is(onScreen(), true);
    dispose();
  })
);

mos.run();
