import { Accessor, createSignal, onCleanup } from "solid-js";

// preserve backwards compatibility with old enum-style Schedule
export const Schedule = {
  Timeout: setTimeout,
  Interval: setInterval
};

/**
 * Creates a timer that runs a callback after a delay repeatedly or once. Originally
 * ported from https://github.com/donavon/use-interval/blob/master/src/index.tsx
 *
 * @param callback - Function that will be called after {@link delay} ms
 * @param delay - Number representing the delay in ms
 * @param scheduler - Function to schedule the timer with. Accepts
 * setTimeout and setInterval, defaulting to setTimeout.
 * @return Provides a manual clear/end function.
 *
 * @example
 * ```ts
 * let [count, setCount] = createSignal(0);
 * createTimer(() => setCount(count() + 1), 500, setInterval);
 * return <h1>Counting up: {count()}</h1>;
 * ```
 */
export const createTimer = (
  callback: () => void,
  delay: number,
  scheduler: typeof setTimeout | typeof setInterval = setTimeout
): (() => void) => {
  // todo: remove clear
  let clear: () => void;
  const intervalId = scheduler(callback, delay);
  clear = () => clearInterval(intervalId);
  onCleanup(clear);
  return clear;
};

/**
 * Repeatedly polls a function, returning an accessor containing the
 * last return value of the function.
 *
 * @param callback - Function that will be called after {@link delay} ms
 * @param delay - Number representing the delay in ms, or an accessor which
 * returns a number representing a variable delay in ms, or false to pause the timer.
 * Restarts the {@link scheduler} whenever the accessor changes.
 * @param scheduler - Optional function to schedule the timer with. Accepts
 * setInterval and setTimeout, defaulting to setInterval.
 * @return Accessor containing the latest return value of the {@link callback}
 *
 * @example
 * ```ts
 * const time = createTimer(() => Date(), 1000);
 * return <h1>Current time: {time()}</h1>;
 * ```
 */
export function createPolled<T>(
  callback: (prev: T | undefined) => T,
  delay: number
): Accessor<T | undefined>;
export function createPolled<T>(
  handler: (prev: T) => T,
  timeout: number,
  init: T,
  scheduler?: typeof setTimeout | typeof setInterval
): Accessor<T>;
export function createPolled<T>(
  handler: (prev: T) => T,
  timeout: number,
  init?: T,
  scheduler: typeof setTimeout | typeof setInterval = setInterval
): Accessor<T> {
  const [polled, setPolled] = createSignal<T>(init!);
  createTimer(() => setPolled(handler), timeout, scheduler);
  return polled;
}

export default createTimer;
