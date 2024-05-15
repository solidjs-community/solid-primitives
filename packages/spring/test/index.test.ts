import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createSpring } from "../src/index.js";

// ===========================================================================
// Tests
// ===========================================================================

describe("createSpring", () => {
  it("returns values", () => {
    const { value, setValue, dispose } = createRoot(dispose => {
      const [value, setValue] = createSpring({ progress: 0 });
      expect(value().progress, "initial value should be { progress: 0 }").toBe(0);

      return { value, setValue, dispose };
    });

    setValue({ progress: 100 });
    dispose();
  });

  it("updates toward target", async () => {
    let dispose!: () => void;
    let setSpringed!: (
      newValue: number,
      opts?: { hard?: boolean; soft?: boolean },
    ) => Promise<void>;
    let springed!: () => number;

    createRoot(d => {
      dispose = d;
      [springed, setSpringed] = createSpring(0);
    });

    expect(springed()).toBe(0);
    setSpringed(50); // Set to 100 here.

    // Not sure if this will be erratic.
    await new Promise(resolve => setTimeout(resolve, 300));

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(springed()).not.toBe(50);
    expect(springed()).toBeGreaterThan(50 / 2);
    dispose();
  });

  it("instantly updates when set with hard.", () => {
    let dispose!: () => void;
    let setSpringed!: (
      newValue: number,
      opts?: { hard?: boolean; soft?: boolean },
    ) => Promise<void>;
    let springed!: () => number;

    createRoot(d => {
      dispose = d;
      [springed, setSpringed] = createSpring(0);
    });

    // const start = performance.now();
    expect(springed()).toBe(0);
    setSpringed(50, { hard: true }); // Set to 100 here.

    // expect(springed()).toBe(0);

    // _flush_raf(start + 300);
    expect(springed()).toBe(50);

    dispose();
  });
});
