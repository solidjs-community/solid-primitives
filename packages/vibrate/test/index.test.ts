import { describe, test, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import {
  makeVibrate,
  createVibrate,
  isVibrationSupported,
  frequencyToPattern,
  makePulse,
  createPulse,
  type VibratePattern,
} from "../src/index.js";

const vibrateMock = vi.fn().mockReturnValue(true);

beforeAll(() => {
  Object.defineProperty(navigator, "vibrate", {
    value: vibrateMock,
    configurable: true,
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(navigator, "vibrate", {
    value: undefined,
    configurable: true,
  });
});

beforeEach(() => {
  vibrateMock.mockClear();
});

describe("isVibrationSupported", () => {
  test("returns true when navigator.vibrate is available", () => {
    expect(isVibrationSupported()).toBe(true);
  });
});

describe("makeVibrate", () => {
  test("calls navigator.vibrate with a number pattern", () => {
    const [start] = makeVibrate(200);
    start();
    expect(vibrateMock).toHaveBeenCalledWith(200);
  });

  test("calls navigator.vibrate with an array pattern", () => {
    const [start] = makeVibrate([100, 50, 100]);
    start();
    expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100]);
  });

  test("stop calls navigator.vibrate(0)", () => {
    const [, stop] = makeVibrate(200);
    stop();
    expect(vibrateMock).toHaveBeenCalledWith(0);
  });

  test("stop cancels an active interval", () => {
    vi.useFakeTimers();
    const [start, stop] = makeVibrate(100, { interval: 300 });

    start();
    expect(vibrateMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(vibrateMock).toHaveBeenCalledTimes(2);

    stop();
    vi.advanceTimersByTime(600);
    // only the vibrate(0) from stop() — no further pattern calls
    expect(vibrateMock).toHaveBeenCalledTimes(3);
    expect(vibrateMock).toHaveBeenLastCalledWith(0);

    vi.useRealTimers();
  });

  test("calling start again resets the interval", () => {
    vi.useFakeTimers();
    const [start, stop] = makeVibrate(100, { interval: 300 });

    start();
    vi.advanceTimersByTime(150);
    start(); // restart — should reset interval timer
    vi.advanceTimersByTime(300);

    // initial start + second start + interval tick after restart
    expect(vibrateMock).toHaveBeenCalledTimes(3);

    stop();
    vi.useRealTimers();
  });
});

describe("createVibrate", () => {
  test("initial state: not vibrating, supported: true", () => {
    createRoot(dispose => {
      const { vibrating, supported } = createVibrate(200);
      expect(vibrating()).toBe(false);
      expect(supported).toBe(true);
      dispose();
    });
  });

  test("start sets vibrating to true and calls navigator.vibrate", () => {
    const { vibrating, start, dispose } = createRoot(dispose => {
      const { vibrating, start } = createVibrate(200);
      return { vibrating, start, dispose };
    });

    start();
    flush();
    expect(vibrating()).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(200);

    dispose();
  });

  test("stop sets vibrating to false and calls navigator.vibrate(0)", () => {
    const { vibrating, start, stop, dispose } = createRoot(dispose => {
      const { vibrating, start, stop } = createVibrate([100, 50, 100]);
      return { vibrating, start, stop, dispose };
    });

    start();
    flush();
    expect(vibrating()).toBe(true);

    stop();
    flush();
    expect(vibrating()).toBe(false);
    expect(vibrateMock).toHaveBeenLastCalledWith(0);

    dispose();
  });

  test("dispose triggers stop and calls navigator.vibrate(0)", () => {
    const { start, dispose } = createRoot(dispose => {
      const { start } = createVibrate(200);
      return { start, dispose };
    });

    start();
    vibrateMock.mockClear();
    dispose();
    expect(vibrateMock).toHaveBeenCalledWith(0);
  });

  test("interval: repeats pattern periodically", () => {
    vi.useFakeTimers();

    const { start, stop, dispose } = createRoot(dispose => {
      const { start, stop } = createVibrate(100, { interval: 500 });
      return { start, stop, dispose };
    });

    start();
    expect(vibrateMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(vibrateMock).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(500);
    expect(vibrateMock).toHaveBeenCalledTimes(3);

    stop();
    vi.useRealTimers();
    dispose();
  });

  test("reactive pattern: restarts vibration when pattern changes while active", () => {
    const [pattern, setPattern] = createSignal<VibratePattern>(200);

    const { start, dispose } = createRoot(dispose => {
      const { start } = createVibrate(pattern);
      return { start, dispose };
    });

    start();
    flush(); // commit setVibrating(true) + skip initial createEffect apply

    setPattern([100, 50, 100]);
    flush(); // apply fires: pattern changed while vibrating → restart

    // exactly: start() → vibrate(200), pattern change → vibrate([100,50,100])
    expect(vibrateMock).toHaveBeenCalledTimes(2);
    expect(vibrateMock).toHaveBeenNthCalledWith(1, 200);
    expect(vibrateMock).toHaveBeenNthCalledWith(2, [100, 50, 100]);

    dispose();
  });

  test("reactive pattern: does not restart when not vibrating", () => {
    const [pattern, setPattern] = createSignal<VibratePattern>(200);

    const dispose = createRoot(dispose => {
      createVibrate(pattern); // not started
      return dispose;
    });

    flush();
    vibrateMock.mockClear();

    setPattern(500);
    flush();

    // vibrate was never called — pattern change ignored since not vibrating
    expect(vibrateMock).not.toHaveBeenCalled();

    dispose();
  });
});

describe("frequencyToPattern", () => {
  test("2 Hz with default duty cycle produces equal on/off durations", () => {
    const [on, off] = frequencyToPattern(2);
    expect(on).toBe(250);
    expect(off).toBe(250);
  });

  test("4 Hz with 0.25 duty cycle produces shorter on than off", () => {
    const [on, off] = frequencyToPattern(4, 0.25);
    // period = 250ms; independent rounding means sum may be ±1
    expect(on).toBeLessThan(off);
    expect(on + off).toBeGreaterThanOrEqual(249);
    expect(on + off).toBeLessThanOrEqual(251);
  });

  test("1 Hz produces 1000ms period", () => {
    const [on, off] = frequencyToPattern(1);
    expect(on + off).toBe(1000);
  });

  test("duty cycle 0 clamps on to minimum 1ms", () => {
    const [on] = frequencyToPattern(2, 0);
    expect(on).toBeGreaterThanOrEqual(1);
  });

  test("duty cycle 1 clamps off to minimum 1ms", () => {
    const [, off] = frequencyToPattern(2, 1);
    expect(off).toBeGreaterThanOrEqual(1);
  });

  test("near-zero hz does not produce Infinity or NaN", () => {
    const [on, off] = frequencyToPattern(0.0001);
    expect(Number.isFinite(on)).toBe(true);
    expect(Number.isFinite(off)).toBe(true);
  });
});

describe("makePulse", () => {
  test("start calls navigator.vibrate with an array pattern", () => {
    const [start, stop] = makePulse(2);
    start();
    const callArg = vibrateMock.mock.calls[0]![0];
    expect(Array.isArray(callArg)).toBe(true);
    expect((callArg as number[]).length).toBeGreaterThan(0);
    stop();
  });

  test("stop cancels interval and calls navigator.vibrate(0)", () => {
    vi.useFakeTimers();
    const [start, stop] = makePulse(4);

    start();
    const callCountAfterStart = vibrateMock.mock.calls.length;

    stop();
    vi.advanceTimersByTime(2000);
    // only vibrate(0) added after stop — no more pattern calls
    expect(vibrateMock).toHaveBeenCalledTimes(callCountAfterStart + 1);
    expect(vibrateMock).toHaveBeenLastCalledWith(0);

    vi.useRealTimers();
  });

  test("interval fires repeatedly at the chunk duration", () => {
    vi.useFakeTimers();
    const [start, stop] = makePulse(2);

    start();
    expect(vibrateMock).toHaveBeenCalledTimes(1);

    // 2 Hz → period 500ms → chunk ~1000ms (2 cycles)
    vi.advanceTimersByTime(1000);
    expect(vibrateMock).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000);
    expect(vibrateMock).toHaveBeenCalledTimes(3);

    stop();
    vi.useRealTimers();
  });
});

describe("createPulse", () => {
  test("initial state: not pulsing, supported: true", () => {
    createRoot(dispose => {
      const { pulsing, supported } = createPulse(2);
      expect(pulsing()).toBe(false);
      expect(supported).toBe(true);
      dispose();
    });
  });

  test("start sets pulsing to true and calls navigator.vibrate", () => {
    const { pulsing, start, dispose } = createRoot(dispose => {
      const { pulsing, start } = createPulse(2);
      return { pulsing, start, dispose };
    });

    start();
    flush();
    expect(pulsing()).toBe(true);
    const callArg = vibrateMock.mock.calls[0]![0];
    expect(Array.isArray(callArg)).toBe(true);

    dispose();
  });

  test("stop sets pulsing to false and calls navigator.vibrate(0)", () => {
    const { pulsing, start, stop, dispose } = createRoot(dispose => {
      const { pulsing, start, stop } = createPulse(4);
      return { pulsing, start, stop, dispose };
    });

    start();
    flush();
    expect(pulsing()).toBe(true);

    stop();
    flush();
    expect(pulsing()).toBe(false);
    expect(vibrateMock).toHaveBeenLastCalledWith(0);

    dispose();
  });

  test("dispose triggers stop and calls navigator.vibrate(0)", () => {
    const { start, dispose } = createRoot(dispose => {
      const { start } = createPulse(2);
      return { start, dispose };
    });

    start();
    vibrateMock.mockClear();
    dispose();
    expect(vibrateMock).toHaveBeenCalledWith(0);
  });

  test("reactive hz: restarts pulse when frequency changes while active", () => {
    vi.useFakeTimers();
    const [hz, setHz] = createSignal(2);

    const { start, dispose } = createRoot(dispose => {
      const { start } = createPulse(hz);
      return { start, dispose };
    });

    start();
    flush(); // commit setPulsing(true) + skip initial createEffect apply

    vibrateMock.mockClear();
    setHz(4);
    flush(); // apply fires: hz changed while pulsing → restart with new chunk

    // vibrate called once with the new 4 Hz pattern
    expect(vibrateMock).toHaveBeenCalledTimes(1);
    const callArg = vibrateMock.mock.calls[0]![0];
    expect(Array.isArray(callArg)).toBe(true);
    // 4 Hz → period 250ms → on+off = 250ms; chunk has ~4 cycles = 1000ms total
    // verify pattern is shorter per cycle than 2 Hz pattern
    const [first] = callArg as number[];
    expect(first).toBeLessThanOrEqual(250);

    vi.useRealTimers();
    dispose();
  });

  test("reactive hz: does not restart when not pulsing", () => {
    const [hz, setHz] = createSignal(2);

    const dispose = createRoot(dispose => {
      createPulse(hz); // not started
      return dispose;
    });

    flush();
    vibrateMock.mockClear();

    setHz(8);
    flush();

    expect(vibrateMock).not.toHaveBeenCalled();

    dispose();
  });
});
