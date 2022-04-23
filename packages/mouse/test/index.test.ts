import { createStaticStore } from "@solid-primitives/utils";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import { createMousePosition, createPositionToElement } from "../src";

const mp = suite("createMousePosition");

mp("returns fallback", () =>
  createRoot(dispose => {
    const pos = createMousePosition();
    assert.is(pos.x, 0);
    assert.is(pos.y, 0);
    assert.is(pos.sourceType, null);
    assert.is(pos.isInside, false);
    dispose();
  })
);

mp("initial values can be changed", () =>
  createRoot(dispose => {
    const pos = createMousePosition(undefined, {
      initialValue: { x: 69, y: 420 }
    });
    assert.is(pos.x, 69);
    assert.is(pos.y, 420);
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

    assert.is(relative.x, 0);
    assert.is(relative.y, 0);
    assert.is(relative.width, 0);
    assert.is(relative.height, 0);
    assert.is(relative.top, 0);
    assert.is(relative.left, 0);
    assert.is(relative.isInside, true);

    setPos({ x: -20, y: 30 });

    assert.is(relative.x, -20);
    assert.is(relative.y, 30);
    assert.is(relative.width, 0);
    assert.is(relative.height, 0);
    assert.is(relative.top, 0);
    assert.is(relative.left, 0);
    assert.is(relative.isInside, false);

    setPos({ x: 15 });

    assert.is(relative.x, 15);
    assert.is(relative.y, 30);
    assert.is(relative.width, 0);
    assert.is(relative.height, 0);
    assert.is(relative.top, 0);
    assert.is(relative.left, 0);
    assert.is(relative.isInside, false);

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

    assert.is(pos.x, -1);
    assert.is(pos.y, 2);
    assert.is(pos.width, 3);
    assert.is(pos.height, 4);
    assert.is(pos.top, 5);
    assert.is(pos.left, 6);
    assert.is(pos.isInside, false);

    dispose();
  })
);

mte.run();
