import { createRoot, createSignal, flush, onCleanup } from "solid-js";
import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import {
  makeTimer,
  createTimer,
  createTimeoutLoop,
  createPolled,
  createIntervalCounter,
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

// ---------------------------------------------------------------------------
// makeTimer
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// createTimer
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// createTimeoutLoop
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// createPolled
// ---------------------------------------------------------------------------

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
});

// ---------------------------------------------------------------------------
// createIntervalCounter
// ---------------------------------------------------------------------------

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
