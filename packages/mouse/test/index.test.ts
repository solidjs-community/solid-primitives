import { createStaticStore } from "@solid-primitives/utils";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import { createMousePosition, createPositionToElement } from "../src";

const mp = suite("createMousePosition");

mp("returns fallback", () =>
  createRoot(dispose => {
    const pos = createMousePosition();
    assert.equal(pos, {
      x: 0,
      y: 0,
      sourceType: null,
      isInside: false
    });
    dispose();
  })
);

mp("initial values can be changed", () =>
  createRoot(dispose => {
    const pos = createMousePosition(undefined, {
      initialValue: { x: 69, y: 420 }
    });
    assert.equal(pos, {
      x: 69,
      y: 420,
      sourceType: null,
      isInside: false
    });
    dispose();
  })
);

mp.run();

const mte = suite("createMouseToElement");

mte("returns correct values", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [pos, setPos] = createStaticStore({ x: 0, y: 0 });
    const relative = createPositionToElement(el, () => pos);

    assert.equal(relative, {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      isInside: true
    });

    setPos({ x: -20, y: 30 });

    assert.equal(relative, {
      x: -20,
      y: 30,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      isInside: false
    });

    setPos({ x: 15 });

    assert.equal(relative, {
      x: 15,
      y: 30,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      isInside: false
    });

    dispose();
  })
);

mte("initial values can be changed", () =>
  createRoot(dispose => {
    const pos = createPositionToElement(
      () => undefined,
      () => ({ x: 69, y: 420 }),
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

    assert.equal(pos, {
      x: -1,
      y: 2,
      width: 3,
      height: 4,
      top: 5,
      left: 6,
      isInside: false
    });

    dispose();
  })
);

mte.run();
