import { batch, createRoot, createSignal } from "solid-js";
import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { createPolled, createTimer } from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("createTimes", () => {
  test("disposing of root disposes of timers", () => {
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

  test("createTimer calls and disposes when expected with number", () => {
    let timeout_count = 0;
    let interval_count = 0;

    const dispose = createRoot(dispose => {
      createTimer(() => timeout_count++, 100, setTimeout);
      createTimer(() => interval_count++, 100, setInterval);
      return dispose;
    });

    vi.advanceTimersByTime(50); // 0.5, account for drift
    expect(timeout_count).toBe(0);
    expect(interval_count).toBe(0);

    vi.advanceTimersByTime(100); // 1.5
    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(1);

    vi.advanceTimersByTime(100); // 2.5
    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(2);

    dispose();
    vi.advanceTimersByTime(100); // 3.5
    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(2);
  });

  test("createInterval calls when expected with accessor", () => {
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

    batch(() => {
      setPaused(false);
      setDelay(100);
    });

    vi.advanceTimersByTime(10);

    expect(timeout_count).toBe(0);
    expect(interval_count).toBe(0);

    vi.advanceTimersByTime(160);

    expect(timeout_count).toBe(1);
    expect(interval_count).toBe(1);

    dispose();
  });
});

describe("createPolled", () => {
  test("fn called initially and after timeout", () => {
    let n = 0
    const {polled, dispose} = createRoot(dispose => ({
      polled: createPolled(() => ++n, 100),
      dispose,
    }))
    expect(polled()).toBe(1)

    vi.advanceTimersByTime(100)
    expect(polled()).toBe(2)

    dispose()
    expect(polled()).toBe(2)

    vi.advanceTimersByTime(100)
    expect(polled()).toBe(2)
  })

  test("is reactive", () => {
    const [source, setSource] = createSignal(0)

    const {polled, dispose} = createRoot(dispose => ({
      polled: createPolled(source, 100),
      dispose,
    }))
    expect(polled()).toBe(0)

    setSource(1)
    expect(polled()).toBe(1)

    dispose()
    setSource(2)
    expect(polled()).toBe(1)
  })
})
