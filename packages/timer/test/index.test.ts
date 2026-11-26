import { createRoot, createEffect, createSignal, flush, onCleanup, OBSERVE } from "solid-js";
import { attribution } from "solid-js/attribution";
import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import {
  makeTimer,
  createTimer,
  createTimeoutLoop,
  createPolled,
  createIntervalCounter,
  makePausableTimer,
  createPausableTimer,
} from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

// makeTimer
describe("makeTimer", () => {
  test("setTimeout fires once after delay", () => {
    let count = 0;
    makeTimer(() => count++, 100, setTimeout);
    vi.advanceTimersByTime(50);
    expect(count).toBe(0);
    vi.advanceTimersByTime(60);
    expect(count).toBe(1);
    vi.advanceTimersByTime(200);
    expect(count).toBe(1);
  });

  test("setInterval fires repeatedly", () => {
    let count = 0;
    const clear = makeTimer(() => count++, 100, setInterval);
    vi.advanceTimersByTime(350);
    expect(count).toBe(3);
    clear();
  });

  test("returned function clears the timer", () => {
    let count = 0;
    const clear = makeTimer(() => count++, 100, setInterval);
    vi.advanceTimersByTime(150);
    expect(count).toBe(1);
    clear();
    vi.advanceTimersByTime(300);
    expect(count).toBe(1);
  });

  test("caller can register with onCleanup to tie to reactive scope", () => {
    let count = 0;
    const dispose = createRoot(dispose => {
      onCleanup(makeTimer(() => count++, 100, setInterval));
      return dispose;
    });
    vi.advanceTimersByTime(150);
    expect(count).toBe(1);
    dispose();
    vi.advanceTimersByTime(200);
    expect(count).toBe(1);
  });
});

// createTimer
describe("createTimer", () => {
  test("disposing of root clears timers", () => {
    let timeout_count = 0;
    let interval_count = 0;

    createRoot(dispose => {
      createTimer(() => timeout_count++, 20, setTimeout);
      createTimer(() => interval_count++, 20, setInterval);
      dispose();
    });

    vi.advanceTimersByTime(50);

    expect(timeout_count).toBe(0);
    expect(interval_count).toBe(0);
  });

  test("number delay: fires and disposes correctly", () => {
    let timeout_count = 0;
    let interval_count = 0;

    const dispose = createRoot(dispose => {
      createTimer(() => timeout_count++, 100, setTimeout);
      createTimer(() => interval_count++, 100, setInterval);
      return dispose;
    });

    vi.advanceTimersByTime(50);
    expect(timeout_count).toBe(0);
    expect(interval_count).toBe(0);

    vi.advanceTimersByTime(100);
    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(1);

    vi.advanceTimersByTime(100);
    expect(timeout_count).toBe(1); // setTimeout fires only once
    expect(interval_count).toBe(2);

    dispose();
    vi.advanceTimersByTime(100);
    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(2);
  });

  test("accessor delay: pause and resume", () => {
    let timeout_count = 0;
    let interval_count = 0;

    const [paused, setPaused] = createSignal(false);
    const [delay, setDelay] = createSignal(50);

    const dispose = createRoot(dispose => {
      createTimer(
        () => timeout_count++,
        () => !paused() && delay(),
        setTimeout,
      );
      createTimer(
        () => interval_count++,
        () => !paused() && delay(),
        setInterval,
      );
      return dispose;
    });

    setPaused(true);
    vi.advanceTimersByTime(300);

    setPaused(false);
    expect(timeout_count).toBe(0);
    expect(interval_count).toBe(0);

    setPaused(true);
    vi.advanceTimersByTime(100);

    setPaused(false);
    setDelay(100);
    flush();

    vi.advanceTimersByTime(10);
    expect(timeout_count).toBe(0);
    expect(interval_count).toBe(0);

    vi.advanceTimersByTime(160);
    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(1);

    dispose();
  });

  test("accessor delay: false disables the timer", () => {
    let count = 0;
    const [delay, setDelay] = createSignal<number | false>(100);

    const dispose = createRoot(dispose => {
      createTimer(() => count++, delay, setInterval);
      return dispose;
    });

    flush();
    vi.advanceTimersByTime(100);
    expect(count).toBe(1);

    setDelay(false);
    flush();
    vi.advanceTimersByTime(500);
    expect(count).toBe(1);

    setDelay(100);
    flush();
    vi.advanceTimersByTime(100);
    expect(count).toBe(2);

    dispose();
  });
});

// createTimeoutLoop
describe("createTimeoutLoop", () => {
  test("number delay: fires repeatedly and stops on dispose", () => {
    let count = 0;
    const dispose = createRoot(dispose => {
      createTimeoutLoop(() => count++, 100);
      return dispose;
    });
    vi.advanceTimersByTime(350);
    expect(count).toBe(3);
    dispose();
    vi.advanceTimersByTime(200);
    expect(count).toBe(3);
  });

  test("delay only updates between executions", () => {
    let count = 0;
    const [delay, setDelay] = createSignal(100);
    const dispose = createRoot(dispose => {
      createTimeoutLoop(() => count++, delay);
      return dispose;
    });
    flush();

    vi.advanceTimersByTime(100); // fires; setCurrentTimeout(100) — same, no re-run
    expect(count).toBe(1);

    setDelay(200);
    flush(); // commit delay._value=200 so the next callback reads it

    vi.advanceTimersByTime(100); // fires; reads delay()=200, setCurrentTimeout(200)
    expect(count).toBe(2);
    flush(); // effect re-runs: clear old 100ms interval, start new 200ms interval

    vi.advanceTimersByTime(199);
    expect(count).toBe(2);
    vi.advanceTimersByTime(1);
    expect(count).toBe(3);

    dispose();
  });

  test("false → number: loop restarts when delay transitions from false to a number", () => {
    let count = 0;
    const [delay, setDelay] = createSignal<number | false>(100);
    const dispose = createRoot(dispose => {
      createTimeoutLoop(() => count++, delay);
      return dispose;
    });
    flush();

    vi.advanceTimersByTime(100); // first tick
    expect(count).toBe(1);

    setDelay(false);
    flush();

    vi.advanceTimersByTime(100); // tick fires; reads delay()=false, stops loop
    expect(count).toBe(2);
    flush();

    vi.advanceTimersByTime(500); // loop is stopped; no more ticks
    expect(count).toBe(2);

    setDelay(100);
    flush(); // effect re-runs; curr===false so apply receives 100 and restarts

    vi.advanceTimersByTime(100);
    expect(count).toBe(3);
    vi.advanceTimersByTime(100);
    expect(count).toBe(4);

    dispose();
  });

  test("false delay stops the loop after the current execution", () => {
    let count = 0;
    const [delay, setDelay] = createSignal<number | false>(100);
    const dispose = createRoot(dispose => {
      createTimeoutLoop(() => count++, delay);
      return dispose;
    });
    flush();

    vi.advanceTimersByTime(100);
    expect(count).toBe(1);

    setDelay(false);
    flush(); // commit delay._value=false so the next callback reads it

    vi.advanceTimersByTime(100); // fires; reads delay()=false, setCurrentTimeout(false)
    expect(count).toBe(2);
    flush(); // effect re-runs: clear interval, false → no new interval

    vi.advanceTimersByTime(500);
    expect(count).toBe(2);

    dispose();
  });
});

// createPolled
describe("createPolled", () => {
  test("fn called immediately and after each interval", () => {
    let n = 0;
    const { polled, dispose } = createRoot(dispose => ({
      polled: createPolled(() => ++n, 100),
      dispose,
    }));
    expect(polled()).toBe(1);

    vi.advanceTimersByTime(100);
    flush();
    expect(polled()).toBe(2);

    vi.advanceTimersByTime(100);
    flush();
    expect(polled()).toBe(3);

    dispose();
    vi.advanceTimersByTime(100);
    flush();
    expect(polled()).toBe(3);
  });

  test("is reactive to fn's signal dependencies", () => {
    const [source, setSource] = createSignal(0);

    const { polled, dispose } = createRoot(dispose => ({
      polled: createPolled(source, 100),
      dispose,
    }));
    expect(polled()).toBe(0);

    setSource(1);
    flush();
    expect(polled()).toBe(1);

    dispose();
    setSource(2);
    expect(polled()).toBe(1);
  });

  test("initial value is passed to fn on first call", () => {
    const { polled } = createRoot(dispose => ({
      polled: createPolled(prev => (prev ?? 10) + 1, 100, 10),
      dispose,
    }));
    expect(polled()).toBe(11);
  });

  test("reactive delay", () => {
    let n = 0;
    const [delay, setDelay] = createSignal(100);

    const { polled, dispose } = createRoot(dispose => ({
      polled: createPolled(() => ++n, delay),
      dispose,
    }));
    expect(polled()).toBe(1);
    flush();

    vi.advanceTimersByTime(100);
    flush();
    expect(polled()).toBe(2);

    setDelay(50);
    flush();
    vi.advanceTimersByTime(50);
    flush();
    expect(polled()).toBe(3);

    dispose();
  });

  // Regression test for issue #808: memo()[1] is not a function
  // The old implementation used createMemo(() => createSignal(...)) which caused
  // memo()[1] (the setter) to be undefined in production builds.
  test("timer fires correctly before polled accessor is ever read (issue #808)", () => {
    let n = 0;
    const { polled, dispose } = createRoot(dispose => ({
      polled: createPolled(() => ++n, 100),
      dispose,
    }));

    // Advance time without ever calling polled() first — this was the failure mode
    vi.advanceTimersByTime(100);
    flush();
    vi.advanceTimersByTime(100);
    flush();

    // Now read — should reflect the timer-driven updates
    expect(polled()).toBe(3); // initial + 2 timer fires

    dispose();
  });
});

// createIntervalCounter
describe("createIntervalCounter", () => {
  test("starts at 0 and increments each interval", () => {
    const { count, dispose } = createRoot(dispose => ({
      count: createIntervalCounter(100),
      dispose,
    }));
    expect(count()).toBe(0);

    vi.advanceTimersByTime(100);
    flush();
    expect(count()).toBe(1);

    vi.advanceTimersByTime(100);
    flush();
    expect(count()).toBe(2);

    dispose();
    vi.advanceTimersByTime(100);
    flush();
    expect(count()).toBe(2);
  });

  test("reactive delay", () => {
    const [delay, setDelay] = createSignal(100);
    const { count, dispose } = createRoot(dispose => ({
      count: createIntervalCounter(delay),
      dispose,
    }));
    expect(count()).toBe(0);
    flush();

    vi.advanceTimersByTime(100);
    flush();
    expect(count()).toBe(1);

    setDelay(50);
    flush();
    vi.advanceTimersByTime(50);
    flush();
    expect(count()).toBe(2);

    dispose();
  });
});

// effect-feedback diagnostics and disposal
describe("polled value delivery", () => {
  test("createPolled does not mirror derived state through an effect", () => {
    const release = attribution.enable();
    const cap = OBSERVE!.diagnostics.capture();
    try {
      for (let i = 0; i < 6; i++) {
        let n = 0;
        const { polled, dispose } = createRoot(dispose => ({
          polled: createPolled(() => ++n, 100),
          dispose,
        }));
        flush();
        for (let j = 0; j < 4; j++) {
          vi.advanceTimersByTime(100);
          flush();
          expect(polled()).toBe(j + 2);
        }
        dispose();
      }
    } finally {
      const codes = cap.stop().map(e => e.code);
      release();
      expect(codes.filter(c => c.startsWith("EFFECT_"))).toEqual([]);
    }
  });

  test("createIntervalCounter does not mirror derived state through an effect", () => {
    const release = attribution.enable();
    const cap = OBSERVE!.diagnostics.capture();
    try {
      for (let i = 0; i < 6; i++) {
        const { count, dispose } = createRoot(dispose => ({
          count: createIntervalCounter(100),
          dispose,
        }));
        flush();
        for (let j = 0; j < 4; j++) {
          vi.advanceTimersByTime(100);
          flush();
          expect(count()).toBe(j + 1);
        }
        dispose();
      }
    } finally {
      const codes = cap.stop().map(e => e.code);
      release();
      expect(codes.filter(c => c.startsWith("EFFECT_"))).toEqual([]);
    }
  });

  test("options.equals: false notifies on every tick even when the value is unchanged", () => {
    const seen: number[] = [];
    const { dispose } = createRoot(dispose => {
      const polled = createPolled(() => 5, 100, undefined, { equals: false });
      createEffect(polled, v => {
        seen.push(v);
      });
      return { dispose };
    });
    flush();
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(100);
      flush();
    }
    expect(seen).toEqual([5, 5, 5, 5]);
    dispose();
  });

  test("default equality does not notify when the polled value is unchanged", () => {
    const seen: number[] = [];
    const { dispose } = createRoot(dispose => {
      const polled = createPolled(() => 5, 100);
      createEffect(polled, v => {
        seen.push(v);
      });
      return { dispose };
    });
    flush();
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(100);
      flush();
    }
    expect(seen).toEqual([5]);
    dispose();
  });

  test("a custom options.equals decides which ticks notify", () => {
    let n = 0;
    const seen: number[] = [];
    const { dispose } = createRoot(dispose => {
      // values 1,2,3,4: treat values within the same pair as equal
      const polled = createPolled(() => ++n, 100, undefined, {
        equals: (a, b) => Math.ceil(a / 2) === Math.ceil(b / 2),
      });
      createEffect(polled, v => {
        seen.push(v);
      });
      return { dispose };
    });
    flush();
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(100);
      flush();
    }
    expect(seen).toEqual([1, 3]);
    dispose();
  });

  test("function results are returned as values, not invoked", () => {
    let inner = 0;
    const f1 = () => (inner++, "one");
    const f2 = () => (inner++, "two");
    let n = 0;
    const seen: unknown[] = [];
    const { polled, dispose } = createRoot(dispose => {
      const polled = createPolled<any>(() => (n++ === 0 ? f1 : f2), 100);
      createEffect(polled, v => {
        seen.push(v);
      });
      return { polled, dispose };
    });
    flush();
    expect(polled()).toBe(f1);
    vi.advanceTimersByTime(100);
    flush();
    expect(polled()).toBe(f2);
    expect(seen).toEqual([f1, f2]);
    expect(inner).toBe(0);
    dispose();
  });

  test("the value is settled after a single flush per tick", () => {
    let n = 0;
    const seen: number[] = [];
    const { polled, dispose } = createRoot(dispose => {
      const polled = createPolled(() => ++n, 100);
      createEffect(polled, v => {
        seen.push(v);
      });
      return { polled, dispose };
    });
    flush();
    vi.advanceTimersByTime(100);
    flush();
    expect(polled()).toBe(2);
    expect(seen).toEqual([1, 2]);
    dispose();
  });

  test("reading after dispose returns the last value and never re-runs fn", () => {
    let n = 0;
    const { polled, dispose } = createRoot(dispose => ({
      polled: createPolled(() => ++n, 100),
      dispose,
    }));
    flush();
    vi.advanceTimersByTime(100);
    flush();
    vi.advanceTimersByTime(50); // mid-interval
    flush();
    expect(polled()).toBe(2);
    const calls = n;
    dispose();
    expect(vi.getTimerCount()).toBe(0);
    expect(polled()).toBe(2);
    vi.advanceTimersByTime(500);
    flush();
    expect(polled()).toBe(2);
    expect(n).toBe(calls);
  });

  test("reading after dispose is stable for createIntervalCounter", () => {
    const { count, dispose } = createRoot(dispose => ({
      count: createIntervalCounter(100),
      dispose,
    }));
    flush();
    vi.advanceTimersByTime(100);
    flush();
    vi.advanceTimersByTime(150); // mid-interval
    flush();
    expect(count()).toBe(2);
    dispose();
    expect(vi.getTimerCount()).toBe(0);
    expect(count()).toBe(2);
    vi.advanceTimersByTime(300);
    flush();
    expect(count()).toBe(2);
  });
});

// makePausableTimer
describe("makePausableTimer", () => {
  test("fires once after the delay", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    expect(t.remaining()).toBe(100);
    expect(t.isActive()).toBe(false);
    t.start();
    expect(t.isActive()).toBe(true);
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(t.remaining()).toBe(0);
    expect(t.isActive()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("remaining counts down live", () => {
    const t = makePausableTimer(() => {}, 1000);
    t.start();
    vi.advanceTimersByTime(250);
    expect(t.remaining()).toBe(750);
    t.stop();
  });

  test("pause keeps remaining time and resume continues from it", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 1000);
    t.start();
    vi.advanceTimersByTime(400);
    t.pause();
    expect(t.isPaused()).toBe(true);
    expect(t.isActive()).toBe(false);
    expect(t.remaining()).toBe(600);
    vi.advanceTimersByTime(10_000);
    expect(fn).not.toHaveBeenCalled();
    expect(t.remaining()).toBe(600);
    t.resume();
    expect(t.isPaused()).toBe(false);
    vi.advanceTimersByTime(599);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("multiple pause/resume cycles accumulate elapsed time", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 1000);
    t.start();
    vi.advanceTimersByTime(300);
    t.pause();
    vi.advanceTimersByTime(5000);
    t.resume();
    vi.advanceTimersByTime(300);
    t.pause();
    expect(t.remaining()).toBe(400);
    t.resume();
    vi.advanceTimersByTime(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("repeated pause calls do not lose or reset time", () => {
    const t = makePausableTimer(() => {}, 1000);
    t.start();
    vi.advanceTimersByTime(200);
    t.pause();
    vi.advanceTimersByTime(500);
    t.pause();
    t.pause();
    expect(t.remaining()).toBe(800);
  });

  test("repeated resume calls do not reschedule", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 1000);
    t.start();
    vi.advanceTimersByTime(200);
    t.pause();
    t.resume();
    vi.advanceTimersByTime(300);
    t.resume();
    expect(t.remaining()).toBe(500);
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("pause before start is a no-op and start still works", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.pause();
    expect(t.isPaused()).toBe(false);
    t.resume();
    expect(t.isActive()).toBe(false);
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
    t.start();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("resume after fire does nothing", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(100);
    t.resume();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(t.isActive()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  test("pause after fire does nothing", () => {
    const t = makePausableTimer(() => {}, 100);
    t.start();
    vi.advanceTimersByTime(100);
    t.pause();
    expect(t.isPaused()).toBe(false);
    expect(t.remaining()).toBe(0);
  });

  test("start can restart after firing, or while paused/running", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(100);
    t.start();
    vi.advanceTimersByTime(60);
    t.pause();
    t.start(); // discards the paused remainder
    expect(t.isPaused()).toBe(false);
    expect(t.remaining()).toBe(100);
    vi.advanceTimersByTime(60);
    t.start(); // restarts a running timer
    vi.advanceTimersByTime(99);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  test("stop/clear cancels, is idempotent and restores full delay", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(40);
    t.stop();
    t.clear();
    expect(t.remaining()).toBe(100);
    expect(t.isActive()).toBe(false);
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("stop while paused clears paused state", () => {
    const t = makePausableTimer(() => {}, 100);
    t.start();
    t.pause();
    t.stop();
    expect(t.isPaused()).toBe(false);
    t.resume();
    expect(t.isActive()).toBe(false);
  });

  test("reset restarts a running timer with the full delay", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(80);
    t.reset();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("reset keeps a paused timer paused with full remaining", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(80);
    t.pause();
    t.reset();
    expect(t.isPaused()).toBe(true);
    expect(t.remaining()).toBe(100);
    t.resume();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("reset on an idle timer does not start it", () => {
    const t = makePausableTimer(() => {}, 100);
    t.reset();
    expect(t.isActive()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  test("reset after fire restores remaining but stays idle", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(100);
    t.reset();
    expect(t.remaining()).toBe(100);
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("setDelay carries the elapsed fraction while running", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 1000);
    t.start();
    vi.advanceTimersByTime(250); // 25%
    t.setDelay(2000);
    expect(t.remaining()).toBe(1500);
    vi.advanceTimersByTime(1499);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("setDelay while paused rescales remaining without starting", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 1000);
    t.start();
    vi.advanceTimersByTime(500);
    t.pause();
    t.setDelay(100);
    expect(t.remaining()).toBe(50);
    expect(t.isPaused()).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
    t.resume();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("setDelay while idle updates the full delay", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 1000);
    t.setDelay(10);
    expect(t.remaining()).toBe(10);
    t.start();
    vi.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("setDelay to the same value does not reschedule", () => {
    const t = makePausableTimer(() => {}, 1000);
    t.start();
    vi.advanceTimersByTime(300);
    t.setDelay(1000);
    expect(t.remaining()).toBe(700);
    t.stop();
  });

  test("delay of 0 fires on the next tick", () => {
    const fn = vi.fn();
    makePausableTimer(fn, 0).start();
    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("false, negative and Infinity delays never fire but can pause/resume", () => {
    for (const d of [false, -5, Infinity] as const) {
      const fn = vi.fn();
      const t = makePausableTimer(fn, d);
      t.start();
      expect(t.isActive()).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
      t.pause();
      t.resume();
      vi.advanceTimersByTime(1e9);
      expect(fn).not.toHaveBeenCalled();
      t.stop();
    }
  });

  test("setDelay from never to finite starts the countdown fresh", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, Infinity);
    t.start();
    vi.advanceTimersByTime(1000);
    t.setDelay(100);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("pausing exactly as the deadline passes keeps 0 remaining and resume fires", () => {
    const fn = vi.fn();
    const t = makePausableTimer(fn, 100);
    t.start();
    vi.advanceTimersByTime(99);
    t.pause();
    expect(t.remaining()).toBe(1);
    t.resume();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("uses performance.now for elapsed time", () => {
    const t = makePausableTimer(() => {}, 1000);
    t.start();
    const spy = vi.spyOn(performance, "now").mockReturnValue(performance.now() + 400);
    expect(t.remaining()).toBeCloseTo(600, 0);
    spy.mockRestore();
    t.stop();
  });

  test("callback may restart the timer", () => {
    let count = 0;
    const t = makePausableTimer(() => {
      if (++count < 3) t.start();
    }, 10);
    t.start();
    vi.advanceTimersByTime(100);
    expect(count).toBe(3);
  });
});

// createPausableTimer
describe("createPausableTimer", () => {
  test("autostarts and fires once, then disposes timers", () => {
    const fn = vi.fn();
    const dispose = createRoot(dispose => {
      createPausableTimer(fn, 100);
      return dispose;
    });
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("autoStart: false waits for start()", () => {
    const fn = vi.fn();
    createRoot(dispose => {
      const t = createPausableTimer(fn, 100, { autoStart: false });
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
      expect(t.isActive()).toBe(false);
      t.start();
      flush();
      expect(t.isActive()).toBe(true);
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  test("clears the timeout on dispose", () => {
    const fn = vi.fn();
    const dispose = createRoot(dispose => {
      createPausableTimer(fn, 100);
      return dispose;
    });
    expect(vi.getTimerCount()).toBe(1);
    dispose();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  test("signal accessors react to pause/resume/fire", () => {
    createRoot(dispose => {
      const t = createPausableTimer(() => {}, 1000);
      const seen: Array<[boolean, boolean]> = [];
      createEffect(
        () => [t.isActive(), t.isPaused()] as [boolean, boolean],
        v => void seen.push(v),
      );
      flush();
      expect(seen.at(-1)).toEqual([true, false]);
      vi.advanceTimersByTime(300);
      t.pause();
      flush();
      expect(seen.at(-1)).toEqual([false, true]);
      expect(t.remaining()).toBe(700);
      t.resume();
      flush();
      expect(seen.at(-1)).toEqual([true, false]);
      vi.advanceTimersByTime(700);
      flush();
      expect(seen.at(-1)).toEqual([false, false]);
      expect(t.remaining()).toBe(0);
      dispose();
    });
  });

  test("remaining accessor re-runs on transitions", () => {
    createRoot(dispose => {
      const t = createPausableTimer(() => {}, 1000);
      const seen: number[] = [];
      createEffect(
        () => t.remaining(),
        v => void seen.push(v),
      );
      flush();
      vi.advanceTimersByTime(250);
      t.pause();
      flush();
      expect(seen.at(-1)).toBe(750);
      t.reset();
      flush();
      expect(seen.at(-1)).toBe(1000);
      dispose();
    });
  });

  test("reactive delay change carries the elapsed fraction", () => {
    const fn = vi.fn();
    const [delay, setDelay] = createSignal(1000);
    const dispose = createRoot(dispose => {
      createPausableTimer(fn, delay);
      return dispose;
    });
    flush();
    vi.advanceTimersByTime(250);
    setDelay(2000);
    flush();
    vi.advanceTimersByTime(1499);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("reactive delay change while paused stays paused", () => {
    const fn = vi.fn();
    const [delay, setDelay] = createSignal(1000);
    let t!: ReturnType<typeof createPausableTimer>;
    const dispose = createRoot(dispose => {
      t = createPausableTimer(fn, delay);
      return dispose;
    });
    flush();
    vi.advanceTimersByTime(500);
    t.pause();
    setDelay(100);
    flush();
    expect(t.remaining()).toBe(50);
    expect(t.isPaused()).toBe(true);
    t.resume();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("delay false disables, a number later re-enables", () => {
    const fn = vi.fn();
    const [delay, setDelay] = createSignal<number | false>(false);
    const dispose = createRoot(dispose => {
      createPausableTimer(fn, delay);
      return dispose;
    });
    flush();
    vi.advanceTimersByTime(10_000);
    expect(fn).not.toHaveBeenCalled();
    setDelay(100);
    flush();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    dispose();
  });

  test("toast: pause on enter, resume on leave", () => {
    const fn = vi.fn();
    createRoot(dispose => {
      const t = createPausableTimer(fn, 5000);
      vi.advanceTimersByTime(3000);
      t.pause(); // pointerenter / focusin
      vi.advanceTimersByTime(60_000);
      expect(fn).not.toHaveBeenCalled();
      t.resume(); // pointerleave / focusout
      vi.advanceTimersByTime(1999);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  test("fn runs untracked and a throwing-free callback may restart", () => {
    const [s] = createSignal(0);
    let runs = 0;
    createRoot(dispose => {
      const t = createPausableTimer(() => {
        s();
        if (++runs < 2) t.start();
      }, 10);
      vi.advanceTimersByTime(100);
      expect(runs).toBe(2);
      dispose();
    });
  });

  describe("pauseWhenHidden", () => {
    let visibility: "visible" | "hidden" = "visible";
    const setVisibility = (v: "visible" | "hidden") => {
      visibility = v;
      document.dispatchEvent(new Event("visibilitychange"));
    };
    beforeEach(() => {
      visibility = "visible";
      vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
    });
    afterAll(() => vi.restoreAllMocks());

    test("pauses while hidden and resumes when visible", () => {
      const fn = vi.fn();
      createRoot(dispose => {
        const t = createPausableTimer(fn, 1000, { pauseWhenHidden: true });
        vi.advanceTimersByTime(400);
        setVisibility("hidden");
        expect(t.isPaused()).toBe(true);
        vi.advanceTimersByTime(10_000);
        expect(fn).not.toHaveBeenCalled();
        setVisibility("visible");
        expect(t.isActive()).toBe(true);
        expect(t.remaining()).toBe(600);
        vi.advanceTimersByTime(600);
        expect(fn).toHaveBeenCalledTimes(1);
        dispose();
      });
    });

    test("starts paused when created while hidden", () => {
      visibility = "hidden";
      const fn = vi.fn();
      createRoot(dispose => {
        const t = createPausableTimer(fn, 1000, { pauseWhenHidden: true });
        expect(t.isPaused()).toBe(true);
        vi.advanceTimersByTime(5000);
        expect(fn).not.toHaveBeenCalled();
        setVisibility("visible");
        vi.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(1);
        dispose();
      });
    });

    test("does not resume a manual pause", () => {
      createRoot(dispose => {
        const t = createPausableTimer(() => {}, 1000, { pauseWhenHidden: true });
        t.pause(); // user hovering
        setVisibility("hidden");
        setVisibility("visible");
        expect(t.isPaused()).toBe(true);
        dispose();
      });
    });

    test("a manual pause while hidden takes ownership", () => {
      createRoot(dispose => {
        const t = createPausableTimer(() => {}, 1000, { pauseWhenHidden: true });
        setVisibility("hidden");
        t.pause();
        setVisibility("visible");
        expect(t.isPaused()).toBe(true);
        dispose();
      });
    });

    test("does not resume a stopped or fired timer on visible", () => {
      createRoot(dispose => {
        const t = createPausableTimer(() => {}, 1000, { pauseWhenHidden: true });
        setVisibility("hidden");
        t.stop();
        setVisibility("visible");
        expect(t.isActive()).toBe(false);
        dispose();
      });
    });

    test("ignores visibility when the option is off", () => {
      const fn = vi.fn();
      createRoot(dispose => {
        const t = createPausableTimer(fn, 1000);
        setVisibility("hidden");
        expect(t.isActive()).toBe(true);
        vi.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(1);
        dispose();
      });
    });

    test("removes the visibilitychange listener on dispose", () => {
      const add = vi.spyOn(document, "addEventListener");
      const remove = vi.spyOn(document, "removeEventListener");
      createRoot(dispose => {
        createPausableTimer(() => {}, 1000, { pauseWhenHidden: true });
        dispose();
      });
      const added = add.mock.calls.filter(c => c[0] === "visibilitychange");
      const removed = remove.mock.calls.filter(c => c[0] === "visibilitychange");
      expect(added.length).toBe(1);
      expect(removed.length).toBe(1);
      expect(removed[0]![1]).toBe(added[0]![1]);
    });
  });
});
