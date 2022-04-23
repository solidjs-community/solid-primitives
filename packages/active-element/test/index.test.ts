import { fireEvent, createEvent } from "solid-testing-library";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  makeActiveElementListener,
  createActiveElement,
  makeFocusListener,
  createFocusSignal
} from "../src";

const testNAEL = suite("makeActiveElementListener");

const dispatchFocusEvent = (target: Element | Window = window, event: "focus" | "blur" = "focus") =>
  fireEvent(target, createEvent(event, window));

testNAEL("works properly", () =>
  createRoot(dispose => {
    let events = 0;
    let captured;
    makeActiveElementListener(e => ((captured = e), events++));
    assert.is(captured, undefined);
    dispatchFocusEvent();
    assert.is(captured, null);
    assert.is(events, 1);

    dispose();
    dispatchFocusEvent();
    assert.is(events, 1);

    const clear = makeActiveElementListener(e => events++);
    dispatchFocusEvent();
    assert.is(events, 2);

    clear();
    dispatchFocusEvent();
    assert.is(events, 2);
  })
);

testNAEL.run();

const testNFL = suite("makeFocusListener");

testNFL("works properly", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const captured: any[] = [];
    const clear = makeFocusListener(el, e => captured.push(e));
    assert.equal(captured, []);
    dispatchFocusEvent(el, "focus");
    assert.equal(captured, [true]);
    dispatchFocusEvent(el, "blur");
    assert.equal(captured, [true, false]);
    clear();
    dispatchFocusEvent(el, "focus");
    assert.equal(captured, [true, false]);
    makeFocusListener(el, e => captured.push(e));
    dispatchFocusEvent(el, "blur");
    assert.equal(captured, [true, false, false]);
    dispose();
    dispatchFocusEvent(el, "focus");
    assert.equal(captured, [true, false, false]);
  })
);

testNFL.run();

const testCAE = suite("createActiveElement");

testCAE("works properly", () =>
  createRoot(dispose => {
    const activeEl = createActiveElement();
    assert.is(activeEl(), null);
    dispose();
  })
);

testCAE.run();

const testCFS = suite("createFocusSignal");

testCFS("works properly", () =>
  createRoot(dispose => {
    const el = document.createElement("div");
    const activeEl = createFocusSignal(el);
    assert.is(activeEl(), false);
    dispose();
  })
);

testCFS.run();
