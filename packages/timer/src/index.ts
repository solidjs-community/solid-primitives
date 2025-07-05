import {
  createSignal,
  onCleanup,
  createEffect,
  untrack,
  type Accessor,
  type SignalOptions,
  createMemo,
} from "solid-js";
import { isServer } from "solid-js/web";

export type TimeoutSource = number | Accessor<number | false>;

/**
 * Create a timer ({@link setTimeout} or {@link setInterval})
 * which automatically clears when the reactive scope is disposed.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number representing the time between executions of {@link fn} in ms.
 * @param timer The timer to create: {@link setTimeout} or {@link setInterval}.
 * @returns Function to manually clear the interval.
 */
export const makeTimer = (
  fn: VoidFunction,
  delay: number,
  timer: typeof setTimeout | typeof setInterval,
): VoidFunction => {
  if (isServer) {
    return () => void 0;
  }
  const intervalId = timer(fn, delay);
  const clear = () => clearInterval(intervalId);
  return onCleanup(clear);
};

/**
 * Create a timer ({@link setTimeout} or {@link setInterval})
 * with an optionally reactive delay.
 * If it changes, the elapsed fraction of the previous delay
 * will be counted as elapsed for the first new delay as well.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number or {@link Accessor} containing a number representing
 * the time between executions of {@link fn} in ms, or false to disable the timer.
 * @param timer The timer to create: {@link setTimeout} or {@link setInterval}.
 */
export const createTimer = (
  fn: VoidFunction,
  delay: TimeoutSource,
  timer: typeof setTimeout | typeof setInterval,
): void => {
  if (isServer) {
    return void 0;
  }
  if (typeof delay === "number") {
    makeTimer(fn, delay, timer);
    return;
  }

  let done = false;
  let prevTime = performance.now();
  let fractionDone: number = 0;
  let shouldHandleFraction = false;
  const callHandler = () => {
    untrack(fn);
    prevTime = performance.now();
    done = timer === setTimeout;
  };

  createEffect((prevDelay?: number | false) => {
    if (done) return;
    const currDelay = delay();
    if (currDelay === false) {
      // if false, update fractionDone and pause
      if (prevDelay) fractionDone += (performance.now() - prevTime) / prevDelay;
      return currDelay;
    }

    // if resuming from pause, set prevTime to now
    if (prevDelay === false) prevTime = performance.now();

    if (shouldHandleFraction) {
      if (prevDelay) fractionDone += (performance.now() - prevTime) / prevDelay;
      prevTime = performance.now();
      if (fractionDone >= 1) {
        fractionDone = 0;
        callHandler();
      } else if (fractionDone > 0) {
        // 0 < fractionDone < 1, need to reconcile the delay
        // signal to rerun this effect when we're done reconciling the delay
        const [listen, rerunEffect] = createSignal(undefined, { equals: false });
        listen();
        makeTimer(
          () => {
            fractionDone = 0;
            shouldHandleFraction = false;
            rerunEffect();
            callHandler();
          },
          (1 - fractionDone) * currDelay,
          setTimeout,
        );
        return currDelay;
      }
    }

    shouldHandleFraction = true;
    makeTimer(callHandler, currDelay, timer);
    return currDelay;
  });
};

/**
 * Like an interval from {@link createTimer}
 * except the timeout only updates between executions.
 *
 * @param handler Function to be called every {@link timeout}
 * @param timeout Number or Function returning a number representing the time
 * between executions of {@link handler} in ms, or false to disable looping.
 */
export const createTimeoutLoop = (handler: VoidFunction, timeout: TimeoutSource): void => {
  if (isServer) {
    return void 0;
  }
  if (typeof timeout === "number") {
    makeTimer(handler, timeout, setInterval);
    return;
  }
  const [currentTimeout, setCurrentTimeout] = createSignal(untrack(timeout));
  createEffect(() => {
    const currTimeout = currentTimeout();
    if (currTimeout === false) return;
    makeTimer(
      () => {
        handler();
        setCurrentTimeout(timeout);
      },
      currTimeout,
      setInterval,
    );
  });
};

/**
 * Polls a function periodically. Returns an {@link Accessor} containing the latest polled value.
 *
 * @param fn Function to be executed immediately, then every {@link timeout}.
 * @param timeout Number or {@link Accessor} containing a number representing
 * the time between executions of {@link fn} in ms, or false to disable polling.
 * @param value Initial value passed to {@link fn}. Defaults to undefined.
 * @param options Signal options for createSignal.
 * @returns An {@link Accessor} containing the latest polled value.
 * @example
 * const date = createPolled(() => new Date(), 1000);
 * date() // T: Date
 * // with reactive delay
 * const [delay, setDelay] = createSignal(1000);
 * createPolled(() => new Date(), delay);
 */
export function createPolled<T extends P, P = T>(
  fn: (prev: P | Exclude<undefined, P>) => T,
  timeout: TimeoutSource,
  value?: undefined,
  options?: SignalOptions<T>,
): Accessor<T>;
export function createPolled<T extends P, I = T, P = T>(
  fn: (prev: P | I) => T,
  timeout: TimeoutSource,
  value: I,
  options?: SignalOptions<T>,
): Accessor<T>;
export function createPolled<T>(
  fn: (prev: T | undefined) => T,
  timeout: TimeoutSource,
  value?: T,
  options?: SignalOptions<T>,
): Accessor<T> {
  if (isServer) {
    return fn as Accessor<T>;
  }
  const memo = createMemo(() => createSignal(fn(value), options), options);
  createTimer(() => memo()[1](fn), timeout, setInterval);
  return () => memo()[0]();
}

/**
 * Creates a counter which increments periodically.
 *
 * @param timeout Number or {@link Accessor} containing a number representing
 * the time between increments in ms, or false to disable the counter.
 * @returns An {@link Accessor} containing the current count.
 */
export const createIntervalCounter = (
  timeout: TimeoutSource,
  options?: SignalOptions<number>,
): Accessor<number> => {
  if (isServer) {
    return () => 0;
  }
  return createPolled(prev => prev + 1, timeout, -1, options);
};
