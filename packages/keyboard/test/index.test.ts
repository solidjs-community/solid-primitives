import { createComputed, createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { createKeyHold, useKeyDownList, useCurrentlyHeldKey, useKeyDownSequence } from "../src";

const dispatchKeyEvent = (key: string, type: "keydown" | "keyup") => {
  let ev = new Event(type) as any;
  ev.key = key;
  window.dispatchEvent(ev);
};

describe("useKeyDownList", () => {
  test("returns a list of currently held keys", () =>
    createRoot(dispose => {
      let captured: any;
      const [keys] = useKeyDownList();
      createComputed(() => (captured = keys()));
      expect(captured).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      expect(captured).toEqual(["A"]);

      dispatchKeyEvent("a", "keyup");
      expect(captured).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      dispatchKeyEvent("q", "keydown");
      expect(captured).toEqual(["ALT", "Q"]);

      dispatchKeyEvent("Alt", "keyup");
      dispatchKeyEvent("q", "keyup");
      expect(captured).toEqual([]);

      dispose();
    }));

  test("returns a last keydown event", () =>
    createRoot(dispose => {
      let captured: any;
      const [, { event }] = useKeyDownList();
      createComputed(() => (captured = event()));

      dispatchKeyEvent("a", "keydown");
      expect(captured).instanceOf(Event);
      expect(captured.key).toBe("a");

      dispatchKeyEvent("Alt", "keydown");
      expect(captured.key).toBe("Alt");

      dispatchKeyEvent("Alt", "keyup");
      dispatchKeyEvent("a", "keyup");
      expect(captured.key).toBe("Alt");

      dispose();
    }));
});

describe("useCurrentlyHeldKey", () => {
  test("returns currently held key", () =>
    createRoot(dispose => {
      let captured: any;
      const key = useCurrentlyHeldKey();
      createComputed(() => (captured = key()));
      expect(captured).toBe(null);

      dispatchKeyEvent("a", "keydown");
      expect(captured).toBe("A");

      dispatchKeyEvent("a", "keyup");
      expect(captured).toBe(null);

      dispatchKeyEvent("Alt", "keydown");
      expect(captured).toBe("ALT");
      dispatchKeyEvent("q", "keydown");
      expect(captured).toBe(null);

      dispatchKeyEvent("Alt", "keyup");
      expect(captured).toBe(null);
      dispatchKeyEvent("q", "keyup");
      expect(captured).toBe(null);

      dispose();
    }));
});

describe("useKeyDownSequence", () => {
  test("returns sequence of pressing currently held keys", () =>
    createRoot(dispose => {
      let captured: any;
      const sequence = useKeyDownSequence();
      createComputed(() => (captured = sequence()));
      expect(captured).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      expect(captured).toEqual([["A"]]);

      dispatchKeyEvent("a", "keyup");
      expect(captured).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      expect(captured).toEqual([["ALT"]]);
      dispatchKeyEvent("q", "keydown");
      expect(captured).toEqual([["ALT"], ["ALT", "Q"]]);

      dispatchKeyEvent("Alt", "keyup");
      expect(captured).toEqual([["ALT"], ["ALT", "Q"], ["Q"]]);
      dispatchKeyEvent("q", "keyup");
      expect(captured).toEqual([]);

      dispose();
    }));
});

// describe("createKeyHold", () => {
//   test("returns a boolean of is the wanted key pressed", () =>
//     createRoot(dispose => {
//       let captured: any;
//       const key = useCurrentlyHeldKey();
//       const isHeld = createKeyHold("ALT");
//       createComputed(() => (captured = isHeld()));
//       expect(captured).toBe(false);

//       dispatchKeyEvent("ALT", "keydown");

//       console.log(key());

//       // expect(captured).toBe(true);

//       dispatchKeyEvent("a", "keyup");
//       // assert.equal(captured, false);

//       // dispatchKeyEvent("Alt", "keydown");
//       // assert.equal(captured, [["ALT"]]);
//       // dispatchKeyEvent("q", "keydown");
//       // assert.equal(captured, [["ALT"], ["ALT", "Q"]]);

//       // dispatchKeyEvent("Alt", "keyup");
//       // assert.equal(captured, [["ALT"], ["ALT", "Q"], ["Q"]]);
//       // dispatchKeyEvent("q", "keyup");
//       // assert.equal(captured, []);

//       dispose();
//     }));
// });

// const testCKH = suite("createKeyHold");

// testCKH.run();

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
