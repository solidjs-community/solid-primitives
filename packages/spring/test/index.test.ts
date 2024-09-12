import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { createDerivedSpring, createSpring } from "../src/index.js";

describe("createSpring", () => {
  it("returns values", () => {
    const { setValue, dispose } = createRoot(dispose => {
      const [value, setValue] = createSpring({ progress: 0 });
      expect(value().progress, "initial value should be { progress: 0 }").toBe(0);

      return { value, setValue, dispose };
    });

    setValue({ progress: 100 });
    dispose();
  });

  it("updates toward target", async () => {
    const { dispose, springed, setSpringed } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring(0);
      return { dispose, springed, setSpringed };
    });

    expect(springed()).toBe(0);
    setSpringed(50);

    // Not sure if this will be erratic.
    await new Promise(resolve => setTimeout(resolve, 300));

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(springed()).not.toBe(50);
    expect(springed()).toBeGreaterThan(50 / 2);
    dispose();
  });

  it("instantly updates `number` when set with hard.", () => {
    const start = 0;
    const end = 50;

    const { springed, setSpringed, dispose } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring(start);

      return { springed, setSpringed, dispose };
    });

    expect(springed()).toBe(start);
    setSpringed(end, { hard: true });

    expect(springed()).toBe(end);

    dispose();
  });

  it("instantly updates `Date` when set with hard.", () => {
    const start = new Date("2024-04-14T00:00:00.000Z");
    const end = new Date("2024-04-14T00:00:00.000Z");

    const { springed, setSpringed, dispose } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring(start);

      return { springed, setSpringed, dispose };
    });

    expect(springed().getDate()).toBe(start.getDate());
    setSpringed(end, { hard: true }); // Set to 100 here.

    expect(springed().getDate()).toBe(end.getDate());

    dispose();
  });

  it("instantly updates `{ progress: 1 }` when set with hard.", () => {
    const start = { progress: 1 };
    const end = { progress: 100 };

    const { springed, setSpringed, dispose } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring(start);

      return { springed, setSpringed, dispose };
    });

    expect(springed()).toMatchObject(start);
    setSpringed(end, { hard: true }); // Set to 100 here.

    expect(springed()).toMatchObject(end);

    dispose();
  });

  it("instantly updates `Array<number>` when set with hard.", () => {
    const start = [1, 2, 3];
    const end = [20, 15, 20];

    const { springed, setSpringed, dispose } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring(start);

      return { springed, setSpringed, dispose };
    });

    expect(springed()).toMatchObject(start);
    setSpringed(end, { hard: true }); // Set to 100 here.

    expect(springed()).toMatchObject(end);

    dispose();
  });

  it("instantly updates `number` when set with hard using a function as an argument.", () => {
    const start = 0;
    const end = 50;

    const { springed, setSpringed, dispose } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring(start);

      return { springed, setSpringed, dispose };
    });

    expect(springed()).toBe(start);
    setSpringed(_ => end, { hard: true }); // Using a function as an argument.

    expect(springed()).toBe(end);

    dispose();
  });

  it("instantly updates `{ progress: 1 }` when set with hard using a function as an argument.", () => {
    const start = { progress: 1 };
    const end = { progress: 100 };

    const { springed, setSpringed, dispose } = createRoot(dispose => {
      const [springed, setSpringed] = createSpring({ progress: 1 });

      return { springed, setSpringed, dispose };
    });

    expect(springed()).toMatchObject(start);
    setSpringed(_ => ({ progress: 100 }), { hard: true }); // Using a function as an argument.

    expect(springed()).toMatchObject(end);

    dispose();
  });
});

describe("createDerivedSpring", () => {
  it("updates toward accessor target", async () => {
    const [signal, setSignal] = createSignal(0);

    const { springed, dispose } = createRoot(dispose => {
      const springed = createDerivedSpring(signal);

      return { springed, dispose };
    });

    expect(springed()).toBe(0);
    setSignal(50); // Set to 100 here.

    // Not sure if this will be erratic.
    await new Promise(resolve => setTimeout(resolve, 300));

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(springed()).not.toBe(50);
    expect(springed()).toBeGreaterThan(50 / 2);
    dispose();
  });
});
