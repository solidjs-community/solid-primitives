import { createComputed, createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import { createScrollPosition, getScrollPosition } from "../src/index";

const gsp = suite("getScrollPosition");

gsp("no target returns null", () => {
  assert.equal(getScrollPosition(undefined), { x: null, y: null });
});

gsp("get's scroll of window", () => {
  const target = window;
  Object.assign(target, { scrollY: 123, scrollX: 222 });
  assert.equal(getScrollPosition(target), { x: 222, y: 123 });
});

gsp("get's scroll of html Element", () => {
  const target = document.createElement("div");
  Object.assign(target, { scrollTop: 123, scrollLeft: 222 });
  assert.equal(getScrollPosition(target), { x: 222, y: 123 });
});

gsp.run();

const csp = suite("createScrollPosition");

csp("will observe scroll events", () =>
  createRoot(dispose => {
    const expectedX = [0, 100, 42];
    const actualX: number[] = [];
    const expectedY = [0, 34, 11];
    const actualY: number[] = [];

    const target = document.createElement("div");

    const scroll = createScrollPosition(target);

    createComputed(() => {
      actualX.push(scroll.x);
      actualY.push(scroll.y);
    });

    Object.assign(target, { scrollTop: 34, scrollLeft: 100 });
    target.dispatchEvent(new Event("scroll"));

    Object.assign(target, { scrollTop: 11, scrollLeft: 42 });
    target.dispatchEvent(new Event("scroll"));

    assert.equal(actualX, expectedX);
    assert.equal(actualY, expectedY);

    dispose();
  })
);

csp("target is reactive", () =>
  createRoot(dispose => {
    const div1 = document.createElement("div");
    Object.assign(div1, { scrollTop: 34, scrollLeft: 100 });

    const div2 = document.createElement("div");
    Object.assign(div2, { scrollTop: 11, scrollLeft: 42 });

    const [target, setTarget] = createSignal<Element | undefined>(div1);

    const scroll = createScrollPosition(target);
    assert.equal(scroll, { x: 100, y: 34 });

    setTarget(div2);
    assert.equal(scroll, { x: 42, y: 11 });

    setTarget();
    assert.equal(scroll, { x: null, y: null });

    dispose();
  })
);

csp.run();
