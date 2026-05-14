import { createSignal, onCleanup, createEffect, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { INTERNAL_OPTIONS, noop, access, type MaybeAccessor } from "@solid-primitives/utils";

export type VibratePattern = number | number[];

export interface VibrateOptions {
  /** Milliseconds between pattern repetitions. Omit to vibrate once per call. */
  interval?: number;
}

export interface PulseOptions {
  /**
   * Fraction of each cycle spent vibrating (0–1). Defaults to `0.5`.
   * A higher value produces longer buzzes; a lower value produces shorter taps.
   */
  dutyCycle?: number;
}

/**
 * Returns `true` when the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
 * is available in the current environment.
 */
export const isVibrationSupported = (): boolean => !isServer && "vibrate" in navigator;

/**
 * Non-reactive vibration helper. No Solid lifecycle dependency.
 * Both returned functions are no-ops when the Vibration API is unavailable.
 *
 * @param pattern Duration in ms or an array of alternating on/off durations.
 * @param options Optional `interval` to repeat the pattern periodically.
 * @returns `[start, stop]`
 *
 * @example
 * ```ts
 * const [start, stop] = makeVibrate([200, 100, 200]);
 * button.addEventListener("click", start);
 * ```
 */
export function makeVibrate(
  pattern: VibratePattern,
  options: VibrateOptions = {},
): [start: VoidFunction, stop: VoidFunction] {
  if (!isVibrationSupported()) return [noop, noop];

  const { interval } = options;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const stop: VoidFunction = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    navigator.vibrate(0);
  };

  const start: VoidFunction = () => {
    navigator.vibrate(pattern);
    if (interval !== undefined) {
      clearInterval(intervalId);
      intervalId = setInterval(() => navigator.vibrate(pattern), interval);
    }
  };

  return [start, stop];
}

/**
 * Reactive vibration primitive tied to the current reactive owner.
 *
 * Accepts a reactive `pattern` — when it changes while vibrating, the vibration
 * restarts automatically with the new value. Stops and cleans up on owner disposal.
 *
 * @param pattern Duration in ms, an array of alternating durations, or a reactive accessor.
 * @param options Optional `interval` to repeat the pattern periodically.
 * @returns `{ vibrating, start, stop, supported }`
 *
 * @example
 * ```ts
 * const { vibrating, start, stop } = createVibrate([200, 100, 200]);
 *
 * createEffect(() => {
 *   console.log("vibrating:", vibrating());
 * });
 * ```
 */
export function createVibrate(
  pattern: MaybeAccessor<VibratePattern>,
  options: VibrateOptions = {},
): {
  vibrating: Accessor<boolean>;
  start: VoidFunction;
  stop: VoidFunction;
  supported: boolean;
} {
  const supported = isVibrationSupported();

  if (!supported) {
    return { vibrating: () => false, start: noop, stop: noop, supported };
  }

  const { interval } = options;
  const [vibrating, setVibrating] = createSignal(false, INTERNAL_OPTIONS);
  let isVibrating = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const doVibrate = () => navigator.vibrate(access(pattern));

  const stop: VoidFunction = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    navigator.vibrate(0);
    isVibrating = false;
    setVibrating(false);
  };

  const start: VoidFunction = () => {
    doVibrate();
    if (interval !== undefined) {
      clearInterval(intervalId);
      intervalId = setInterval(doVibrate, interval);
    }
    isVibrating = true;
    setVibrating(true);
  };

  // When a reactive pattern changes while vibrating, restart with the new value.
  // Skip the initial apply (the first run establishes the baseline; only changes matter).
  // Use the apply's `newPattern` argument directly to avoid a reactive read inside the callback.
  if (typeof pattern === "function") {
    let initialized = false;
    createEffect(
      () => pattern(),
      (newPattern: VibratePattern) => {
        if (!initialized) {
          initialized = true;
          return;
        }
        if (isVibrating) {
          navigator.vibrate(newPattern);
          if (interval !== undefined) {
            clearInterval(intervalId);
            intervalId = setInterval(() => navigator.vibrate(newPattern), interval);
          }
        }
      },
    );
  }

  onCleanup(stop);

  return { vibrating, start, stop, supported };
}

// ─── Pulse / frequency primitives ────────────────────────────────────────────

// Duration of a single repeating chunk sent to navigator.vibrate.
// The setInterval fires at the same cadence so patterns join seamlessly.
const PULSE_CHUNK_MS = 1000;

/**
 * Converts a frequency in Hz and an optional duty cycle into a single-cycle
 * vibration pattern `[onMs, offMs]`.
 *
 * Useful for building custom patterns or visualising what `makePulse` /
 * `createPulse` will produce at a given frequency.
 *
 * @param hz Vibrations per second (must be > 0).
 * @param dutyCycle Fraction of the cycle spent vibrating (0–1). Defaults to `0.5`.
 * @returns `[onMs, offMs]`
 *
 * @example
 * ```ts
 * frequencyToPattern(2)     // [250, 250]  — 2 Hz, equal on/off
 * frequencyToPattern(4, 0.25) // [62, 188] — 4 Hz, short tap
 * ```
 */
export function frequencyToPattern(hz: number, dutyCycle = 0.5): [on: number, off: number] {
  const period = 1000 / Math.max(0.001, hz);
  const dc = Math.max(0, Math.min(1, dutyCycle));
  const on = Math.max(1, Math.round(period * dc));
  const off = Math.max(1, Math.round(period * (1 - dc)));
  return [on, off];
}

/** Build a multi-cycle chunk ≈ PULSE_CHUNK_MS long and return its exact duration. */
function buildChunk(hz: number, dutyCycle: number): { pattern: number[]; duration: number } {
  const clampedHz = Math.max(0.1, Math.min(hz, 100));
  const [on, off] = frequencyToPattern(clampedHz, dutyCycle);
  const cycles = Math.max(1, Math.round(PULSE_CHUNK_MS / (on + off)));
  const pattern: number[] = [];
  for (let i = 0; i < cycles; i++) pattern.push(on, off);
  return { pattern, duration: cycles * (on + off) };
}

/**
 * Non-reactive pulse helper. Triggers a repeating vibration at `hz` cycles per
 * second. No Solid lifecycle dependency; both functions are no-ops when the
 * Vibration API is unavailable.
 *
 * @param hz Pulse frequency in Hz.
 * @param options `dutyCycle` controls the on/off ratio (default `0.5`).
 * @returns `[start, stop]`
 *
 * @example
 * ```ts
 * const [start, stop] = makePulse(4); // 4 taps per second
 * button.addEventListener("pointerdown", start);
 * button.addEventListener("pointerup", stop);
 * ```
 */
export function makePulse(
  hz: number,
  options: PulseOptions = {},
): [start: VoidFunction, stop: VoidFunction] {
  if (!isVibrationSupported()) return [noop, noop];
  const { dutyCycle = 0.5 } = options;
  const { pattern, duration } = buildChunk(hz, dutyCycle);
  return makeVibrate(pattern, { interval: duration });
}

/**
 * Reactive pulse primitive. Ties cleanup to the current reactive owner.
 *
 * Accepts a reactive `hz` accessor — when the frequency changes while pulsing,
 * the vibration restarts immediately at the new rhythm. This makes it easy to
 * implement effects like urgency escalation or heartbeat visualisations.
 *
 * @param hz Pulse frequency in Hz, or a reactive accessor returning one.
 * @param options `dutyCycle` controls the on/off ratio (default `0.5`).
 * @returns `{ pulsing, start, stop, supported }`
 *
 * @example
 * ```ts
 * // Fixed frequency
 * const { pulsing, start, stop } = createPulse(2);
 *
 * // Reactive frequency — escalates as a countdown reaches zero
 * const [seconds, setSeconds] = createSignal(10);
 * const hz = createMemo(() => 1 + (10 - seconds()) * 0.5);
 * const { start, stop } = createPulse(hz);
 * ```
 */
export function createPulse(
  hz: MaybeAccessor<number>,
  options: PulseOptions = {},
): {
  pulsing: Accessor<boolean>;
  start: VoidFunction;
  stop: VoidFunction;
  supported: boolean;
} {
  const supported = isVibrationSupported();

  if (!supported) {
    return { pulsing: () => false, start: noop, stop: noop, supported };
  }

  const { dutyCycle = 0.5 } = options;
  const [pulsing, setPulsing] = createSignal(false, INTERNAL_OPTIONS);
  let isPulsing = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const applyPulse = (currentHz: number) => {
    const { pattern, duration } = buildChunk(currentHz, dutyCycle);
    navigator.vibrate(pattern);
    clearInterval(intervalId);
    intervalId = setInterval(() => navigator.vibrate(pattern), duration);
  };

  const stop: VoidFunction = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    navigator.vibrate(0);
    isPulsing = false;
    setPulsing(false);
  };

  const start: VoidFunction = () => {
    applyPulse(access(hz));
    isPulsing = true;
    setPulsing(true);
  };

  // When hz changes while pulsing, restart at the new frequency.
  // Skip the initial apply; use the apply argument to avoid reactive reads in the callback.
  if (typeof hz === "function") {
    let initialized = false;
    createEffect(
      () => hz(),
      (newHz: number) => {
        if (!initialized) {
          initialized = true;
          return;
        }
        if (isPulsing) applyPulse(newHz);
      },
    );
  }

  onCleanup(stop);

  return { pulsing, start, stop, supported };
}
