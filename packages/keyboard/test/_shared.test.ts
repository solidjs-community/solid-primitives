import { useCurrentlyHeldKey, useKeyDownList, useKeyDownSequence } from "../src";
import { createComputed, createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const dispatchKeyEvent = (key: string, type: "keydown" | "keyup") => {
  let ev = new Event(type) as any;
  ev.key = key;
  window.dispatchEvent(ev);
};

const testKDL = suite("useKeyDownList");

testKDL("returns a list of currently held keys", () =>
  createRoot(dispose => {
    let captured: any;
    const [keys] = useKeyDownList();
    createComputed(() => (captured = keys()));
    assert.equal(captured, []);

    dispatchKeyEvent("a", "keydown");
    assert.equal(captured, ["A"]);

    dispatchKeyEvent("a", "keyup");
    assert.equal(captured, []);

    dispatchKeyEvent("Alt", "keydown");
    dispatchKeyEvent("q", "keydown");
    assert.equal(captured, ["ALT", "Q"]);

    dispatchKeyEvent("Alt", "keyup");
    dispatchKeyEvent("q", "keyup");
    assert.equal(captured, []);

    dispose();
  })
);

testKDL("returns a last keydown event", () =>
  createRoot(dispose => {
    let captured: any;
    const [, { event }] = useKeyDownList();
    createComputed(() => (captured = event()));

    dispatchKeyEvent("a", "keydown");
    assert.instance(captured, Event);
    assert.is(captured.key, "a");

    dispatchKeyEvent("Alt", "keydown");
    assert.is(captured.key, "Alt");

    dispatchKeyEvent("Alt", "keyup");
    dispatchKeyEvent("a", "keyup");
    assert.is(captured.key, "Alt");

    dispose();
  })
);

testKDL.run();

const testCHK = suite("useCurrentlyHeldKey");

testCHK("returns currently held key", () =>
  createRoot(dispose => {
    let captured: any;
    const key = useCurrentlyHeldKey();
    createComputed(() => (captured = key()));
    assert.is(captured, null);

    dispatchKeyEvent("a", "keydown");
    assert.is(captured, "A");

    dispatchKeyEvent("a", "keyup");
    assert.is(captured, null);

    dispatchKeyEvent("Alt", "keydown");
    assert.is(captured, "ALT");
    dispatchKeyEvent("q", "keydown");
    assert.is(captured, null);

    dispatchKeyEvent("Alt", "keyup");
    assert.is(captured, null);
    dispatchKeyEvent("q", "keyup");
    assert.is(captured, null);

    dispose();
  })
);

testCHK.run();

const testKDS = suite("useKeyDownSequence");

testKDS("returns sequence of pressing currently held keys", () =>
  createRoot(dispose => {
    let captured: any;
    const sequence = useKeyDownSequence();
    createComputed(() => (captured = sequence()));
    assert.equal(captured, []);

    dispatchKeyEvent("a", "keydown");
    assert.equal(captured, [["A"]]);

    dispatchKeyEvent("a", "keyup");
    assert.equal(captured, []);

    dispatchKeyEvent("Alt", "keydown");
    assert.equal(captured, [["ALT"]]);
    dispatchKeyEvent("q", "keydown");
    assert.equal(captured, [["ALT"], ["ALT", "Q"]]);

    dispatchKeyEvent("Alt", "keyup");
    assert.equal(captured, [["ALT"], ["ALT", "Q"], ["Q"]]);
    dispatchKeyEvent("q", "keyup");
    assert.equal(captured, []);

    dispose();
  })
);

testKDS.run();
