import { createRoot } from "solid-js";
import { describe, it, expect } from "vitest";
import { pan, pinch, rotate, swipe, tap, registerPointerListener } from "../src/index.js";

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
});

describe("pinch", () => {
  it("calls callback with scale when two pointers move", () =>
    createRoot(dispose => {
      const node = makeNode();
      const scales: number[] = [];
      const ref = pinch({ callback: (scale) => scales.push(scale) });
      ref(node);

      // two fingers down 50px apart
      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50);
      // initDistance = 100
      // move to 200px apart
      pointermove(node, 1, 0, 50);  // triggers initial prevDistance set
      pointermove(node, 2, 200, 50); // triggers callback
      // at this point: prevDistance was set from first move, curDistance = 200 → scale 2
      expect(scales.length).toBeGreaterThan(0);

      dispose();
      document.body.removeChild(node);
    }));
});

describe("rotate", () => {
  it("calls callback with rotation when two pointers move", () =>
    createRoot(dispose => {
      const node = makeNode();
      const rotations: number[] = [];
      const ref = rotate({ callback: (r) => rotations.push(r) });
      ref(node);

      // two fingers horizontal: angle = 0 or 180 depending on quadrant
      pointerdown(node, 1, 0, 50);
      pointerdown(node, 2, 100, 50);
      // initial angle recorded on down
      pointermove(node, 1, 0, 50);  // set prevAngle
      pointermove(node, 1, 0, 100); // change angle → fires callback
      expect(rotations.length).toBeGreaterThan(0);

      dispose();
      document.body.removeChild(node);
    }));
});
