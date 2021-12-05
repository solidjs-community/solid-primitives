import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createActiveElement, createIsElementActive } from "../src";

let listeners = 0;
window.addEventListener = (...a: any[]) => {
  listeners++;
};
window.removeEventListener = (...a: any[]) => {
  listeners--;
};

const cae = suite("createActiveElement");

cae("returns correct values", () =>
  createRoot(dispose => {
    const [activeEl, { stop, start }] = createActiveElement();

    assert.type(activeEl, "function");
    assert.ok(
      () => activeEl() === null || activeEl() === document.body,
      "no element should be active"
    );
    assert.type(stop, "function");
    assert.type(start, "function");

    dispose();
  })
);

cae("event listeners are created and disposed", () =>
  createRoot(dispose => {
    const [, { stop, start }] = createActiveElement();
    assert.is(listeners, 2, "number of listeners after using primitive should be 2");

    stop();
    assert.is(listeners, 0, "all listeners should be removed after calling stop()");

    start();
    assert.is(listeners, 2, "both listeners should be added again after calling start()");

    dispose();
    assert.is(listeners, 0, "all listeners should be removed after disposing of root");
  })
);

cae.run();

const iea = suite("createIsElementActive");

iea("returns correct values", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [isFocused, { stop, start }] = createIsElementActive(el);

    assert.type(isFocused, "function");
    assert.is(isFocused(), false);
    assert.type(stop, "function");
    assert.type(start, "function");

    dispose();
  })
);

iea("target can be an accessor", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const [isFocused, { stop, start }] = createIsElementActive(() => el);

    assert.type(isFocused, "function");
    assert.is(isFocused(), false);
    assert.type(stop, "function");
    assert.type(start, "function");

    dispose();
  })
);

iea("event listeners are created and disposed", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    let listeners = 0;
    el.addEventListener = () => {
      listeners++;
    };
    el.removeEventListener = () => {
      listeners--;
    };

    const [, { start }] = createIsElementActive(el);
    assert.is(listeners, 0, "number of listeners after using primitive should be 0");

    start();
    assert.is(listeners, 2, "both listeners should be added after calling start()");

    dispose();
    assert.is(listeners, 0, "all listeners should be removed after disposing of root");
  })
);

iea.run();
