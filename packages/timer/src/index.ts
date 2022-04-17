import { createSignal, onCleanup, createEffect, untrack, Accessor } from "solid-js";

/**
 * Create a timer ({@link setTimeout} or {@link setInterval})
 * which automatically clears when the reactive scope is disposed.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number representing the time between executions of {@link fn} in ms.
 * @returns Function to manually clear the interval
 */
export const makeTimer = (
  fn: () => void,
  delay: number,
  timer: typeof setTimeout | typeof setInterval
): (() => void) => {
  const intervalId = timer(fn, delay);
  const clear = () => clearInterval(intervalId);
  onCleanup(clear);
  return clear;
};

/**
 * Create a timer ({@link setTimeout} or {@link setInterval})
 * with an optionally reactive delay.
 * If it changes, the elapsed fraction of the previous delay
 * will be counted as elapsed for the first new delay as well.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number or {@link Accessor} containing a number
 * representing the time between executions of {@link fn} in ms.
 */
export const createTimer = (
  fn: () => void,
  delay: number | Accessor<number>,
  timer: typeof setTimeout | typeof setInterval
): void => {
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

  createEffect((prevDelay?: number) => {
    if (done) return;
    const currDelay = delay();

    // check prevDelay to make sure it isn't 0 or undefined to avoid Infinity and NaN
    if (shouldHandleFraction && prevDelay) {
      fractionDone += (performance.now() - prevTime) / prevDelay;
      if (fractionDone < 1) {
        prevTime = performance.now();
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
          setTimeout
        );
        return currDelay;
      } else {
        callHandler();
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
 * @param timeout Number or Function returning a number representing
 * the time between executions of {@link handler} in ms.
 */
export const createTimeoutLoop = (handler: () => void, timeout: number | (() => number)): void => {
  if (typeof timeout === "number") {
    makeTimer(handler, timeout, setInterval);
    return;
  }
  const [currentTimeout, setCurrentTimeout] = createSignal(untrack(timeout));
  createEffect(() =>
    makeTimer(
      () => {
        handler();
        setCurrentTimeout(timeout);
      },
      currentTimeout(),
      setInterval
    )
  );
};

/**
 * Polls a function periodically. Returns an {@link Accessor} containing the latest polled value.
 *
 * @param timeout Number or {@link Accessor} containing a number representing
 * the time between executions of {@link fn} in ms.
 * @returns An {@link Accessor} containing the latest polled value.
 */
export const createPolled = <T>(
  fn: (prev?: T) => T,
  timeout: Accessor<number> | number
): Accessor<T> => {
  const [polled, setPolled] = createSignal(untrack(() => fn()));
  createTimer(() => setPolled(fn), timeout, setInterval);
  return polled;
};

/**
 * Creates a counter which increments periodically.
 *
 * @param timeout Number or {@link Accessor} containing a number representing
 * the time between increments in ms.
 * @returns An {@link Accessor} containing the current count.
 */
export const createIntervalCounter = (timeout: number | Accessor<number>): Accessor<number> => {
  return createPolled(prev => (prev === undefined ? 0 : prev + 1), timeout);
};
