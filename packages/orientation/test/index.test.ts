import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createEffect, createRoot, flush } from "solid-js";
import { makeOrientation, createOrientation, type OrientationState } from "../src/index.js";

// Minimal mock for screen.orientation
class MockScreenOrientation extends EventTarget {
  angle = 0;
  type = "portrait-primary";

  simulate(angle: number, type: string) {
    this.angle = angle;
    this.type = type;
    this.dispatchEvent(new Event("change"));
  }
}

const mockOrientation = new MockScreenOrientation();

beforeAll(() => {
  Object.defineProperty(screen, "orientation", {
    get: () => mockOrientation,
    configurable: true,
  });
});

afterAll(() => {
  Object.defineProperty(screen, "orientation", {
    get: () => undefined,
    configurable: true,
  });
});

beforeEach(() => {
  mockOrientation.angle = 0;
  mockOrientation.type = "portrait-primary";
});

describe("makeOrientation", () => {
  test("calls onChange when orientation changes", () => {
    const states: OrientationState[] = [];
    const cleanup = makeOrientation(state => states.push({ ...state }));

    mockOrientation.simulate(90, "landscape-primary");
    expect(states).toHaveLength(1);
    expect(states[0]).toEqual({ angle: 90, type: "landscape-primary" });

    mockOrientation.simulate(0, "portrait-primary");
    expect(states).toHaveLength(2);
    expect(states[1]).toEqual({ angle: 0, type: "portrait-primary" });

    cleanup();
  });

  test("does not fire before a change occurs", () => {
    const states: OrientationState[] = [];
    const cleanup = makeOrientation(state => states.push({ ...state }));

    expect(states).toHaveLength(0);
    cleanup();
  });

  test("cleanup removes event listener", () => {
    const states: OrientationState[] = [];
    const cleanup = makeOrientation(state => states.push({ ...state }));

    cleanup();
    mockOrientation.simulate(90, "landscape-primary");
    expect(states).toHaveLength(0);
  });

  test("multiple listeners are independent", () => {
    const a: number[] = [];
    const b: number[] = [];

    const cleanupA = makeOrientation(({ angle }) => a.push(angle));
    const cleanupB = makeOrientation(({ angle }) => b.push(angle));

    mockOrientation.simulate(90, "landscape-primary");
    expect(a).toEqual([90]);
    expect(b).toEqual([90]);

    cleanupA();
    mockOrientation.simulate(180, "portrait-secondary");
    expect(a).toEqual([90]);
    expect(b).toEqual([90, 180]);

    cleanupB();
  });
});

describe("createOrientation", () => {
  test("returns current orientation as initial state", () => {
    mockOrientation.angle = 270;
    mockOrientation.type = "landscape-secondary";

    createRoot(dispose => {
      const { angle, type } = createOrientation();
      expect(angle()).toBe(270);
      expect(type()).toBe("landscape-secondary");
      dispose();
    });
  });

  test("updates signals when orientation changes", () => {
    const { angle, type, dispose } = createRoot(dispose => {
      const { angle, type } = createOrientation();
      return { angle, type, dispose };
    });

    expect(angle()).toBe(0);
    expect(type()).toBe("portrait-primary");

    mockOrientation.simulate(90, "landscape-primary");
    flush();
    expect(angle()).toBe(90);
    expect(type()).toBe("landscape-primary");

    mockOrientation.simulate(180, "portrait-secondary");
    flush();
    expect(angle()).toBe(180);
    expect(type()).toBe("portrait-secondary");

    dispose();
  });

  test("stops updating after dispose", () => {
    const { angle, type, dispose } = createRoot(dispose => {
      const { angle, type } = createOrientation();
      return { angle, type, dispose };
    });

    dispose();
    mockOrientation.simulate(90, "landscape-primary");
    flush();
    expect(angle()).toBe(0);
    expect(type()).toBe("portrait-primary");
  });

  test("tracks angle reactively via createEffect", () => {
    const angles: number[] = [];

    const dispose = createRoot(dispose => {
      const { angle } = createOrientation();
      createEffect(angle, (a: number) => {
        angles.push(a);
      });
      return dispose;
    });

    flush(); // initial apply
    mockOrientation.simulate(90, "landscape-primary");
    flush(); // apply after change

    expect(angles).toEqual([0, 90]);
    dispose();
  });

  test("tracks type reactively via createEffect", () => {
    const types: string[] = [];

    const dispose = createRoot(dispose => {
      const { type } = createOrientation();
      createEffect(type, (t: string) => {
        types.push(t);
      });
      return dispose;
    });

    flush(); // initial apply
    mockOrientation.simulate(90, "landscape-primary");
    flush(); // apply after change

    expect(types).toEqual(["portrait-primary", "landscape-primary"]);
    dispose();
  });

  test("multiple independent instances each update", () => {
    const { a, b, dispose } = createRoot(dispose => {
      const a = createOrientation();
      const b = createOrientation();
      return { a, b, dispose };
    });

    mockOrientation.simulate(270, "landscape-secondary");
    flush();
    expect(a.angle()).toBe(270);
    expect(b.angle()).toBe(270);

    dispose();
  });
});
