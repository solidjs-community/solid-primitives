import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createActiveElement, createIsElementActive } from "../src";

const cae = suite("createActiveElement");

cae("returns correct values", () =>
  createRoot(dispose => {
    const [activeEl, stop] = createActiveElement();

    assert.type(activeEl, "function");
    assert.ok(
      () => activeEl() === null || activeEl() === document.body,
      "no element should be active"
    );
    assert.type(stop, "function");

    dispose();
  })
);

cae.run();

const iea = suite("createIsElementActive");

iea("returns correct values", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [isFocused, stop] = createIsElementActive(el);

    assert.type(isFocused, "function");
    assert.is(isFocused(), false);
    assert.type(stop, "function");

    dispose();
  })
);

iea("target can be an accessor", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [isFocused, stop] = createIsElementActive(() => el);

    assert.type(isFocused, "function");
    assert.is(isFocused(), false);
    assert.type(stop, "function");

    dispose();
  })
);

iea.run();
