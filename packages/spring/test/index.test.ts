import { createEffect, createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi, afterAll } from "vitest";
import { createDerivedSpring, createSpring, makeSpring } from "../src/index.js";

let _time = 0;
let _raf_last_id = 0;
let _raf_callbacks_old = new Map<number, FrameRequestCallback>();
let _raf_callbacks_new = new Map<number, FrameRequestCallback>();

function _progress_time(by: number) {
  _time += by;
  _raf_callbacks_old = _raf_callbacks_new;
  _raf_callbacks_new = new Map();
  _raf_callbacks_old.forEach(c => c(_time));
  _raf_callbacks_old.clear();
}

/** Fire 60fps frames until no more RAF callbacks are pending (spring settled). */
function _settle(maxFrames = 2000) {
  for (let i = 0; i < maxFrames; i++) {
    if (_raf_callbacks_new.size === 0) break;
    _progress_time(1000 / 60);
    flush();
  }
}

const _now = performance.now;
performance.now = () => _time;
afterAll(() => {
  performance.now = _now;
});

vi.stubGlobal("requestAnimationFrame", function (callback: FrameRequestCallback): number {
  const id = _raf_last_id++;
  _raf_callbacks_new.set(id, callback);
  return id;
});
vi.stubGlobal("cancelAnimationFrame", function (id: number): void {
  _raf_callbacks_new.delete(id);
});

describe("createSpring", () => {
  it("returns values", () => {
    const [[spring, _setSpring], dispose] = createRoot(d => [createSpring({ progress: 0 }), d]);
    expect(spring().progress).toBe(0);
    dispose();
  });

  it("Setter does not subscribe to self", () => {
    let runs = 0;
    const [signal, setSignal] = createSignal(0);

    const [setSpring, dispose] = createRoot(dispose => {
      const [, setSpring] = createSpring(0);

      createEffect(
        () => signal(),
        () => {
          runs++;
          setSpring(p => p + 1, { hard: true });
        },
      );

      return [setSpring, dispose];
    });

    flush();
    expect(runs).toBe(1);

    setSpring(p => p + 1, { hard: true });
    flush();
    expect(runs).toBe(1);

    setSignal(1);
    flush();
    expect(runs).toBe(2);

    dispose();
  });

  it("instantly updates `number` when set with hard.", () => {
    const start = 0;
    const end = 50;

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toBe(start);
    setSpring(end, { hard: true });
    flush();

    expect(spring()).toBe(end);

    dispose();
  });

  it("instantly updates `Date` when set with hard.", () => {
    const start = new Date("2024-04-14T00:00:00.000Z");
    const end = new Date("2024-04-14T00:00:00.000Z");

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring().getDate()).toBe(start.getDate());
    setSpring(end, { hard: true });
    flush();

    expect(spring().getDate()).toBe(end.getDate());

    dispose();
  });

  it("instantly updates `{ progress: 1 }` when set with hard.", () => {
    const start = { progress: 1 };
    const end = { progress: 100 };

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(end, { hard: true });
    flush();

    expect(spring()).toMatchObject(end);

    dispose();
  });

  it("instantly updates `Array<number>` when set with hard.", () => {
    const start = [1, 2, 3];
    const end = [20, 15, 20];

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(end, { hard: true });
    flush();

    expect(spring()).toMatchObject(end);

    dispose();
  });

  it("instantly updates `number` when set with hard using a function as an argument.", () => {
    const start = 0;
    const end = 50;

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toBe(start);
    setSpring(_ => end, { hard: true });
    flush();

    expect(spring()).toBe(end);

    dispose();
  });

  it("instantly updates `{ progress: 1 }` when set with hard using a function as an argument.", () => {
    const start = { progress: 1 };
    const end = { progress: 100 };

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(_ => ({ progress: 100 }), { hard: true });
    flush();

    expect(spring()).toMatchObject(end);

    dispose();
  });

  it("updates toward target", () => {
    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(0), d]);

    expect(spring()).toBe(0);
    setSpring(50);
    expect(spring()).toBe(0);

    _progress_time(300);
    flush();

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(spring()).not.toBe(50);
    expect(spring()).toBeGreaterThan(50 / 2);
    dispose();
  });

  it("updates array of objects toward target", () => {
    const start = [{ foo: 1 }, { foo: 2 }, { foo: 3 }];
    const end = [{ foo: 20 }, { foo: 15 }, { foo: 20 }];

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(start), d]);

    expect(spring()).toMatchObject(start);
    setSpring(end);

    _progress_time(300);
    flush();

    for (let i = 0; i < start.length; i++) {
      expect(spring()[i]!.foo).toBeGreaterThan(end[i]!.foo / 2);
    }

    dispose();
  });

  it("isAnimating is false initially", () => {
    const [[, , { isAnimating }], dispose] = createRoot(d => [createSpring(0), d]);
    expect(isAnimating()).toBe(false);
    dispose();
  });

  it("isAnimating becomes true when animation starts", () => {
    const [[, setSpring, { isAnimating }], dispose] = createRoot(d => [createSpring(0), d]);
    setSpring(50);
    flush();
    expect(isAnimating()).toBe(true);
    dispose();
  });

  it("isAnimating returns to false after animation settles", () => {
    const [[, setSpring, { isAnimating }], dispose] = createRoot(d => [createSpring(0), d]);
    setSpring(50);
    flush();
    expect(isAnimating()).toBe(true);

    _settle();

    expect(isAnimating()).toBe(false);
    dispose();
  });

  it("isAnimating is false after hard set", () => {
    const [[, setSpring, { isAnimating }], dispose] = createRoot(d => [createSpring(0), d]);
    setSpring(50);
    flush();
    expect(isAnimating()).toBe(true);

    setSpring(100, { hard: true });
    flush();
    expect(isAnimating()).toBe(false);
    dispose();
  });

  it("all pending promises resolve when animation settles", async () => {
    const [[, setSpring], dispose] = createRoot(d => [createSpring(0), d]);

    let firstResolved = false;
    let secondResolved = false;

    const p1 = setSpring(50).then(() => {
      firstResolved = true;
    });
    flush();
    const p2 = setSpring(100).then(() => {
      secondResolved = true;
    });
    flush();

    _settle();

    await Promise.all([p1, p2]);

    expect(firstResolved).toBe(true);
    expect(secondResolved).toBe(true);
    dispose();
  }, 10_000);

  it("pending promises resolve when animation is interrupted by hard set", async () => {
    const [[, setSpring], dispose] = createRoot(d => [createSpring(0), d]);

    let resolved = false;
    const p = setSpring(50).then(() => {
      resolved = true;
    });

    flush();
    expect(resolved).toBe(false);

    setSpring(100, { hard: true });
    flush();

    await p;
    expect(resolved).toBe(true);
    dispose();
  });

  it("pending promises resolve on cleanup", async () => {
    let resolved = false;
    let setSpring!: (v: number) => Promise<void>;

    const dispose = createRoot(d => {
      const [, s] = createSpring(0);
      setSpring = s;
      return d;
    });

    const p = setSpring(50).then(() => {
      resolved = true;
    });
    flush();
    expect(resolved).toBe(false);

    dispose();
    await p;
    expect(resolved).toBe(true);
  });

  it("respects reactive options — hard snaps when options reach stiffness/damping ≥ 1", () => {
    const [opts, setOpts] = createSignal<{ stiffness: number; damping: number }>({
      stiffness: 0.15,
      damping: 0.8,
    });

    const [[spring, setSpring], dispose] = createRoot(d => [createSpring(0, opts), d]);

    // Normal animation — should not snap
    setSpring(50);
    flush();
    expect(spring()).toBe(0);

    // Change opts to force immediate settlement, flush so the write is visible
    setOpts({ stiffness: 1, damping: 1 });
    flush();

    setSpring(100);
    flush();
    expect(spring()).toBe(100);
    dispose();
  });
});

describe("makeSpring", () => {
  it("returns values without a reactive owner", () => {
    const [value] = makeSpring(42);
    expect(value()).toBe(42);
  });

  it("animates toward target", () => {
    const [value, set, , cleanup] = makeSpring(0);
    set(50);
    flush();

    _progress_time(300);
    flush();

    expect(value()).toBeGreaterThan(0);
    expect(value()).not.toBe(50);
    cleanup();
  });

  it("cleanup cancels animation and resolves promises", async () => {
    const [, set, { isAnimating }, cleanup] = makeSpring(0);

    let resolved = false;
    const p = set(50).then(() => {
      resolved = true;
    });
    flush();

    expect(isAnimating()).toBe(true);

    cleanup();

    await p;
    expect(resolved).toBe(true);
    expect(isAnimating()).toBe(false);
  });

  it("isAnimating reflects animation state", () => {
    const [, set, { isAnimating }, cleanup] = makeSpring(0);

    expect(isAnimating()).toBe(false);
    set(50);
    flush();
    expect(isAnimating()).toBe(true);

    _settle();

    expect(isAnimating()).toBe(false);
    cleanup();
  });
});

describe("createDerivedSpring", () => {
  it("updates toward accessor target", () => {
    const [signal, setSignal] = createSignal(0);
    const [spring, dispose] = createRoot(d => [createDerivedSpring(signal), d]);

    expect(spring()).toBe(0);
    setSignal(50);
    flush(); // update signal + run effect which starts RAF

    _progress_time(300);
    flush();

    // spring() should move towards 50 but not 50 after 300ms. (This is estimated spring interpolation is hard to pinpoint exactly)
    expect(spring()).not.toBe(50);
    expect(spring()).toBeGreaterThan(50 / 2);
    dispose();
  });
});
