import { createKeyHold } from "../src";
import { createComputed, createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const dispatchKeyEvent = (key: string, type: "keydown" | "keyup") => {
  let ev = new Event(type) as any;
  ev.key = key;
  window.dispatchEvent(ev);
};

const testCKH = suite("createKeyHold");

testCKH("returns a boolean of is the wanted key pressed", () =>
  createRoot(dispose => {
    let captured: any;
    // const key = useCurrentlyHeldKey();
    const isHeld = createKeyHold("ALT");
    createComputed(() => (captured = isHeld()));
    assert.equal(captured, false);

    dispatchKeyEvent("ALT", "keydown");

    // assert.equal(captured, true);

    dispatchKeyEvent("a", "keyup");
    // assert.equal(captured, false);

    // dispatchKeyEvent("Alt", "keydown");
    // assert.equal(captured, [["ALT"]]);
    // dispatchKeyEvent("q", "keydown");
    // assert.equal(captured, [["ALT"], ["ALT", "Q"]]);

    // dispatchKeyEvent("Alt", "keyup");
    // assert.equal(captured, [["ALT"], ["ALT", "Q"], ["Q"]]);
    // dispatchKeyEvent("q", "keyup");
    // assert.equal(captured, []);

    dispose();
  })
);

testCKH.run();

/*
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

*/
