import { createRoot } from "solid-js";
import { describe, it, expect } from "vitest";
import { pan, pinch, rotate, swipe, tap, longPress, doubleTap, registerPointerListener } from "../src/index.js";

// jsdom 25 does not implement PointerEvent — extend MouseEvent for tests
if (typeof PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
    }
  }
  (globalThis as any).PointerEvent = PointerEventPolyfill;
}

// jsdom 25 does not implement pointer capture — stub as no-ops
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
}

function makeNode() {
  const node = document.createElement("div");
  document.body.appendChild(node);
  // jsdom getBoundingClientRect always returns zeros — give it a real rect
  Object.defineProperty(node, "getBoundingClientRect", {
    value: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
  });
  return node;
}

function pointerdown(target: HTMLElement, id = 1, x = 0, y = 0) {
  target.dispatchEvent(new PointerEvent("pointerdown", { pointerId: id, clientX: x, clientY: y }));
}
function pointermove(target: HTMLElement, id = 1, x = 0, y = 0) {
  target.dispatchEvent(new PointerEvent("pointermove", { pointerId: id, clientX: x, clientY: y }));
}
function pointerup(target: HTMLElement, id = 1, x = 0, y = 0) {
  target.dispatchEvent(new PointerEvent("pointerup", { pointerId: id, clientX: x, clientY: y }));
}

describe("registerPointerListener", () => {
  it("returns a cleanup function that removes the pointerdown listener", () => {
    const node = makeNode();
    let calls = 0;
    const cleanup = registerPointerListener(node, () => calls++);
    pointerdown(node);
    expect(calls).toBe(1);
    cleanup();
    pointerdown(node);
    expect(calls).toBe(1);
    document.body.removeChild(node);
  });

  it("cleanup removes active move handlers registered after pointerdown", () => {
    const node = makeNode();
    let moveCalls = 0;
    const cleanup = registerPointerListener(node, undefined, () => moveCalls++);
    pointerdown(node);
    pointermove(node);
    expect(moveCalls).toBe(1);
    // cleanup mid-gesture — the dynamic pointermove listener should also be removed
    cleanup();
    pointermove(node);
    expect(moveCalls).toBe(1);
    document.body.removeChild(node);
  });

  it("each pointer up removes only that pointer's dynamic handlers", () => {
    const node = makeNode();
    let moveCalls = 0;
    registerPointerListener(node, undefined, () => moveCalls++);

    pointerdown(node, 1);
    pointerdown(node, 2);
    // lift pointer 1 — its handlers should be gone
    pointerup(node, 1);
    // pointer 2 still down; a move should fire the callback exactly once
    pointermove(node, 2, 10, 10);
    expect(moveCalls).toBe(1);

    document.body.removeChild(node);
  });
});

describe("pan", () => {
  it("calls callback on single-pointer move within bounds", () =>
    createRoot(dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = pan({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 10, 20);
      pointermove(node, 1, 30, 40);
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({ x: 30, y: 40 });

      dispose();
      pointermove(node, 1, 50, 60);
      expect(positions).toHaveLength(1);
      document.body.removeChild(node);
    }));

  it("does not fire when two pointers are active", () =>
    createRoot(dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = pan({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerdown(node, 2, 10, 0);
      pointermove(node, 1, 5, 0);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("continues firing outside the element bounds during an active drag", () =>
    createRoot(dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = pan({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      // pointer capture keeps events flowing even outside the element rect
      pointermove(node, 1, 200, 0); // x=200 > rect.width=100 — should still fire
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({ x: 200, y: 0 });

      dispose();
      document.body.removeChild(node);
    }));
});

describe("swipe", () => {
  it("fires right swipe", () =>
    createRoot(dispose => {
      const node = makeNode();
      const directions: string[] = [];
      const ref = swipe({ callback: d => directions.push(d) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 100, 5);
      expect(directions).toEqual(["right"]);

      dispose();
      document.body.removeChild(node);
    }));

  it("fires left swipe", () =>
    createRoot(dispose => {
      const node = makeNode();
      const directions: string[] = [];
      const ref = swipe({ callback: d => directions.push(d) });
      ref(node);

      pointerdown(node, 1, 100, 0);
      pointerup(node, 1, 0, 5);
      expect(directions).toEqual(["left"]);

      dispose();
      document.body.removeChild(node);
    }));

  it("fires bottom swipe", () =>
    createRoot(dispose => {
      const node = makeNode();
      const directions: string[] = [];
      const ref = swipe({ callback: d => directions.push(d) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 5, 100);
      expect(directions).toEqual(["bottom"]);

      dispose();
      document.body.removeChild(node);
    }));

  it("fires top swipe", () =>
    createRoot(dispose => {
      const node = makeNode();
      const directions: string[] = [];
      const ref = swipe({ callback: d => directions.push(d) });
      ref(node);

      pointerdown(node, 1, 0, 100);
      pointerup(node, 1, 5, 0);
      expect(directions).toEqual(["top"]);

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire on diagonal movement", () =>
    createRoot(dispose => {
      const node = makeNode();
      const directions: string[] = [];
      const ref = swipe({ callback: d => directions.push(d) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 80, 80);
      expect(directions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("respects custom minSwipeDistance", () =>
    createRoot(dispose => {
      const node = makeNode();
      const directions: string[] = [];
      const ref = swipe({ callback: d => directions.push(d), parameters: { minSwipeDistance: 200 } });
      ref(node);

      // distance of 100 is below threshold of 200
      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 100, 5);
      expect(directions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));
});

describe("tap", () => {
  it("calls callback on quick stationary tap", () =>
    createRoot(dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = tap({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 10, 20);
      pointerup(node, 1, 10, 20);
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({ x: 10, y: 20 });

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when pointer moves significantly", () =>
    createRoot(dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = tap({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 10, 10);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when held longer than maximumTapLength", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      // maximumTapLength of 1ms — a real held tap in tests exceeds this
      const ref = tap({ callback: pos => positions.push(pos), maximumTapLength: 1 });
      ref(node);

      pointerdown(node, 1, 10, 10);
      // wait >1ms so the tap exceeds maximumTapLength
      await new Promise(r => setTimeout(r, 10));
      pointerup(node, 1, 10, 10);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));
});

describe("pinch", () => {
  it("calls callback with correct scale when two pointers spread", () =>
    createRoot(dispose => {
      const node = makeNode();
      const scales: number[] = [];
      const ref = pinch({ callback: scale => scales.push(scale) });
      ref(node);

      // two fingers 100px apart horizontally
      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50);
      // initDistance = 100; set prevDistance with first move (no position change for ptr1)
      pointermove(node, 1, 0, 50);
      // spread ptr2 to 200px → scale = 200/100 = 2
      pointermove(node, 2, 200, 50);
      expect(scales).toHaveLength(1);
      expect(scales[0]).toBeCloseTo(2);

      dispose();
      document.body.removeChild(node);
    }));

  it("resets after last pointer lifts", () =>
    createRoot(dispose => {
      const node = makeNode();
      const scales: number[] = [];
      const ref = pinch({ callback: scale => scales.push(scale) });
      ref(node);

      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50);
      pointermove(node, 1, 0, 50);
      pointermove(node, 2, 200, 50);
      pointerup(node, 1);
      pointerup(node, 2);

      // second pinch gesture should start fresh
      const prevLen = scales.length;
      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50);
      pointermove(node, 1, 0, 50);
      pointermove(node, 2, 150, 50); // scale = 150/100 = 1.5
      expect(scales.length).toBeGreaterThan(prevLen);
      expect(scales[scales.length - 1]).toBeCloseTo(1.5);

      dispose();
      document.body.removeChild(node);
    }));
});

describe("rotate", () => {
  it("calls callback with a numeric rotation value", () =>
    createRoot(dispose => {
      const node = makeNode();
      const rotations: number[] = [];
      const ref = rotate({ callback: r => rotations.push(r) });
      ref(node);

      // two fingers side by side; rotating one upward changes the angle
      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50);
      pointermove(node, 1, 0, 50); // set prevAngle
      pointermove(node, 1, 0, 0);  // move ptr1 up → angle changes
      expect(rotations.length).toBeGreaterThan(0);
      expect(typeof rotations[0]).toBe("number");
      expect(rotations[0]).toBeGreaterThanOrEqual(-180);
      expect(rotations[0]).toBeLessThanOrEqual(180);

      dispose();
      document.body.removeChild(node);
    }));

  it("clamps rotation to [-180, 180]", () =>
    createRoot(dispose => {
      const node = makeNode();
      const rotations: number[] = [];
      const ref = rotate({ callback: r => rotations.push(r) });
      ref(node);

      // place fingers to establish an initial angle near 0
      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50); // horizontal → initAngle near 0°
      pointermove(node, 1, 0, 50);   // set prevAngle

      // move ptr2 to a position that would give curAngle - initAngle ≈ -270 (= +90 clamped)
      pointermove(node, 2, 50, 150); // below ptr1 — should give large negative unclamped angle

      for (const r of rotations) {
        expect(r).toBeGreaterThanOrEqual(-180);
        expect(r).toBeLessThanOrEqual(180);
      }

      dispose();
      document.body.removeChild(node);
    }));
});

describe("longPress", () => {
  it("fires after the threshold has elapsed", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = longPress({ callback: pos => positions.push(pos), threshold: 20 });
      ref(node);

      pointerdown(node, 1, 10, 20);
      expect(positions).toHaveLength(0);
      await new Promise(r => setTimeout(r, 30));
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({ x: 10, y: 20 });

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when pointer is released before threshold", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = longPress({ callback: pos => positions.push(pos), threshold: 50 });
      ref(node);

      pointerdown(node, 1, 10, 10);
      pointerup(node, 1, 10, 10); // released before threshold
      await new Promise(r => setTimeout(r, 80));
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when pointer moves beyond moveThreshold", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = longPress({ callback: pos => positions.push(pos), threshold: 30 });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointermove(node, 1, 20, 0); // 20px > default moveThreshold (10)
      await new Promise(r => setTimeout(r, 50));
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("cancels when a second pointer goes down", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = longPress({ callback: pos => positions.push(pos), threshold: 30 });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerdown(node, 2, 50, 0); // second finger cancels
      await new Promise(r => setTimeout(r, 50));
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("clears pending timer on component unmount", () =>
    createRoot(async dispose => {
      const node = makeNode();
      let fired = false;
      const ref = longPress({ callback: () => { fired = true; }, threshold: 30 });
      ref(node);

      pointerdown(node, 1, 0, 0);
      dispose(); // unmount before timer fires
      await new Promise(r => setTimeout(r, 50));
      expect(fired).toBe(false);

      document.body.removeChild(node);
    }));
});

describe("doubleTap", () => {
  it("fires after two quick taps at the same position", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = doubleTap({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 10, 20);
      pointerup(node, 1, 10, 20);
      await new Promise(r => setTimeout(r, 10));
      pointerdown(node, 1, 10, 20);
      pointerup(node, 1, 10, 20);
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({ x: 10, y: 20 });

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire on a single tap", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = doubleTap({ callback: pos => positions.push(pos), timeframe: 50 });
      ref(node);

      pointerdown(node, 1, 10, 10);
      pointerup(node, 1, 10, 10);
      await new Promise(r => setTimeout(r, 80)); // window expires
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when second tap arrives after the timeframe", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = doubleTap({ callback: pos => positions.push(pos), timeframe: 30 });
      ref(node);

      pointerdown(node, 1, 10, 10);
      pointerup(node, 1, 10, 10);
      await new Promise(r => setTimeout(r, 60)); // past timeframe
      pointerdown(node, 1, 10, 10);
      pointerup(node, 1, 10, 10);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when taps are too far apart", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = doubleTap({ callback: pos => positions.push(pos), positionThreshold: 10 });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 0, 0);
      await new Promise(r => setTimeout(r, 10));
      pointerdown(node, 1, 50, 0); // 50px away — beyond threshold
      pointerup(node, 1, 50, 0);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("does not fire when pointer drifts >= 4px during a tap", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = doubleTap({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 0, 0);
      pointerup(node, 1, 5, 0); // 5px drift — not a valid tap
      await new Promise(r => setTimeout(r, 10));
      pointerdown(node, 1, 5, 0);
      pointerup(node, 1, 5, 0);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("cancels the pending window when a second pointer goes down", () =>
    createRoot(async dispose => {
      const node = makeNode();
      const positions: { x: number; y: number }[] = [];
      const ref = doubleTap({ callback: pos => positions.push(pos) });
      ref(node);

      pointerdown(node, 1, 10, 10);
      pointerup(node, 1, 10, 10);
      await new Promise(r => setTimeout(r, 10));
      pointerdown(node, 1, 10, 10);
      pointerdown(node, 2, 30, 10); // second pointer cancels
      pointerup(node, 1, 10, 10);
      pointerup(node, 2, 30, 10);
      expect(positions).toHaveLength(0);

      dispose();
      document.body.removeChild(node);
    }));

  it("clears the pending timer on component unmount", () =>
    createRoot(async dispose => {
      const node = makeNode();
      let fired = false;
      const ref = doubleTap({ callback: () => { fired = true; }, timeframe: 200 });
      ref(node);

      // first tap
      pointerdown(node, 1, 10, 10);
      pointerup(node, 1, 10, 10);
      await new Promise(r => setTimeout(r, 10));
      // second tap starts but component unmounts before up
      pointerdown(node, 1, 10, 10);
      dispose();
      pointerup(node, 1, 10, 10);
      expect(fired).toBe(false);

      document.body.removeChild(node);
    }));
});
