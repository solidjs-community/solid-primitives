import * as assert from "uvu/assert";
import { suite } from "uvu";
import { createRoot } from "solid-js";
import { createElementBounds, getElementBounds } from "../src";

const div = document.createElement("div");

const geb = suite("getElementBounds");

geb("getElementBounds", () => {
  assert.equal(getElementBounds(div), {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0
  });
});

geb.run();

const ceb = suite("createElementBounds");

ceb("returns bounds of element", () =>
  createRoot(dispose => {
    const bounds = createElementBounds(div);
    assert.equal(bounds, {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0
    });
    dispose();
  })
);

ceb("returns null if there is no initial element", () =>
  createRoot(dispose => {
    const bounds = createElementBounds(() => undefined);
    assert.equal(bounds, {
      top: null,
      left: null,
      bottom: null,
      right: null,
      width: null,
      height: null
    });
    dispose();
  })
);

ceb.run();
