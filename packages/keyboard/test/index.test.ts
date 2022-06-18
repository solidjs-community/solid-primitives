import { makeKeyHoldListener } from "../src";
import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testMHKL = suite("makeKeyHoldListener");

testMHKL("calls callback in a simple key scenario", () =>
  createRoot(dispose => {
    const captured: boolean[] = [];

    makeKeyHoldListener("a", e => captured.push(e));
    assert.equal(captured, []);

    let ev = new Event("keydown") as any;
    ev.key = "a";
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    ev = new Event("keyup") as any;
    ev.key = "a";
    window.dispatchEvent(ev);

    assert.equal(captured, [true, false]);

    dispose();
  })
);

testMHKL("calls callback in a simple modifier scenario", () =>
  createRoot(dispose => {
    const captured: boolean[] = [];

    makeKeyHoldListener("altKey", e => captured.push(e));
    assert.equal(captured, []);

    let ev = new Event("keydown") as any;
    ev.altKey = true;
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    ev = new Event("keyup") as any;
    ev.altKey = false;
    window.dispatchEvent(ev);

    assert.equal(captured, [true, false]);

    dispose();
  })
);

testMHKL("don't allowOtherKeys — key", () =>
  createRoot(dispose => {
    const captured: boolean[] = [];

    makeKeyHoldListener("a", e => captured.push(e));
    assert.equal(captured, []);

    let ev = new Event("keydown") as any;
    ev.key = "a";
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    ev = new Event("keydown") as any;
    ev.key = "b";
    window.dispatchEvent(ev);

    assert.equal(captured, [true, false]);

    dispose();
  })
);

testMHKL("don't allowOtherKeys — modifier", () =>
  createRoot(dispose => {
    const captured: boolean[] = [];

    makeKeyHoldListener("altKey", e => captured.push(e));
    assert.equal(captured, []);

    let ev = new Event("keydown") as any;
    ev.altKey = true;
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    ev = new Event("keydown") as any;
    ev.altKey = true;
    ev.key = "b";
    window.dispatchEvent(ev);

    assert.equal(captured, [true, false]);

    dispose();
  })
);

testMHKL("allowOtherKeys — key", () =>
  createRoot(dispose => {
    const captured: boolean[] = [];

    makeKeyHoldListener("a", e => captured.push(e), {
      allowOtherKeys: true
    });
    assert.equal(captured, []);

    let ev = new Event("keydown") as any;
    ev.key = "a";
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    ev = new Event("keydown") as any;
    ev.key = "b";
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    dispose();
  })
);

testMHKL("allowOtherKeys — modifier", () =>
  createRoot(dispose => {
    const captured: boolean[] = [];

    makeKeyHoldListener("altKey", e => captured.push(e), {
      allowOtherKeys: true
    });
    assert.equal(captured, []);

    let ev = new Event("keydown") as any;
    ev.altKey = true;
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    ev = new Event("keydown") as any;
    ev.altKey = true;
    ev.key = "b";
    window.dispatchEvent(ev);

    assert.equal(captured, [true]);

    dispose();
  })
);

testMHKL.run();
