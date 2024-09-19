import { createEffect, createRoot, createSignal } from "solid-js";
import { describe, expect, it, vi, afterAll, beforeAll, beforeEach } from "vitest";
import { createDerivedSpring, createSpring } from "../src/index.js";

let _raf_last_id = 0;
let _raf_callbacks_old = new Map<number, FrameRequestCallback>();
let _raf_callbacks_new = new Map<number, FrameRequestCallback>();

function _progress_time(by: number) {
  const start = performance.now();
  vi.advanceTimersByTime(by);

  _raf_callbacks_old = _raf_callbacks_new;
  _raf_callbacks_new = new Map();
  _raf_callbacks_old.forEach(c => c(start + by));
  _raf_callbacks_old.clear();
}

vi.stubGlobal("requestAnimationFrame", function (callback: FrameRequestCallback): number {
  const id = _raf_last_id++;
  _raf_callbacks_new.set(id, callback);
  return id;
});
vi.stubGlobal("cancelAnimationFrame", function (id: number): void {
  _raf_callbacks_new.delete(id);
});

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
  _raf_callbacks_old.clear();
  _raf_callbacks_new.clear();
  _raf_last_id = 0;
});

describe("createSpring", () => {

  it("returns values", () => {
    const [[spring, setSpring], dispose] = createRoot(d => [createSpring({ progress: 0 }), d]);
    expect(spring().progress).toBe(0);
    dispose();
  });

  it("updates toward target", () => {
    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(0), d]);

    expect(spring()).toBe(0);
    setSpring(50);
    expect(spring()).toBe(0);

    _progress_time(300)

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(spring()).not.toBe(50);
    expect(spring()).toBeGreaterThan(50 / 2);
    dispose();
  });

  it("instantly updates `number` when set with hard.", () => {
    const start = 0;
    const end = 50;

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toBe(start);
    setSpring(end, { hard: true });

    expect(spring()).toBe(end);

    dispose();
  });

  it("instantly updates `Date` when set with hard.", () => {
    const start = new Date("2024-04-14T00:00:00.000Z");
    const end = new Date("2024-04-14T00:00:00.000Z");

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring().getDate()).toBe(start.getDate());
    setSpring(end, { hard: true }); // Set to 100 here.

    expect(spring().getDate()).toBe(end.getDate());

    dispose();
  });

  it("instantly updates `{ progress: 1 }` when set with hard.", () => {
    const start = { progress: 1 };
    const end = { progress: 100 };

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(end, { hard: true }); // Set to 100 here.

    expect(spring()).toMatchObject(end);

    dispose();
  });

  it("instantly updates `Array<number>` when set with hard.", () => {
    const start = [1, 2, 3];
    const end = [20, 15, 20];

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(end, { hard: true }); // Set to 100 here.

    expect(spring()).toMatchObject(end);

    dispose();
  });

  it("Setter does not subscribe to self", () => {
    let runs = 0
    const [signal, setSignal] = createSignal(0)
    
    const [setSpring, dispose] = createRoot(dispose => {
      const [, setSpring] = createSpring(0)

      createEffect(() => {
        runs++
        setSpring(p => {
          signal() // this one should be tracked
          return p+1
        }, { hard: true })
      })

      return [setSpring, dispose]
    });
    expect(runs).toBe(1)

    setSpring(p => p+1, { hard: true })
    expect(runs).toBe(1)

    setSignal(1)
    expect(runs).toBe(2)

    dispose();
  });

  it("instantly updates `number` when set with hard using a function as an argument.", () => {
    const start = 0;
    const end = 50;

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toBe(start);
    setSpring(_ => end, { hard: true }); // Using a function as an argument.

    expect(spring()).toBe(end);

    dispose();
  });

  it("instantly updates `{ progress: 1 }` when set with hard using a function as an argument.", () => {
    const start = { progress: 1 };
    const end = { progress: 100 };

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(_ => ({ progress: 100 }), { hard: true }); // Using a function as an argument.

    expect(spring()).toMatchObject(end);

    dispose();
  });
});

describe("createDerivedSpring", () => {
  it("updates toward accessor target", () => {
    const [signal, setSignal] = createSignal(0);
    const [spring, dispose] = createRoot(d => [createDerivedSpring(signal), d]);

    expect(spring()).toBe(0);
    setSignal(50); // Set to 100 here.
    expect(spring()).toBe(0);

    _progress_time(300)

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(spring()).not.toBe(50);
    expect(spring()).toBeGreaterThan(50 / 2);
    dispose();
  });
});
