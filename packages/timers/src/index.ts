import { createSignal, onCleanup, createEffect, untrack, Accessor } from "solid-js";

/**
 * {@link setInterval} which automatically clears when the reactive scope is disposed.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number representing the time between executions of {@link fn} in ms.
 * @returns Function to manually clear the interval
 */
export const createBasicInterval = (fn: () => void, delay: number): (() => void) => {
  const intervalId = setInterval(fn, delay);
  const clear = () => clearInterval(intervalId);
  onCleanup(clear);
  return clear;
};

/**
 * {@link setTimeout} which automatically clears when the reactive scope is disposed.
 *
 * @param fn Function to be called after {@link delay}.
 * @param delay Number representing the time before executing {@link fn} in ms.
 * @returns Function to manually clear the timeout
 */
export const createBasicTimeout = (fn: () => void, delay: number): (() => void) => {
  const timeoutId = setTimeout(fn, delay);
  const clear = () => clearTimeout(timeoutId);
  onCleanup(clear);
  return clear;
};

/**
 * {@link setTimeout} with an optionally reactive delay. If it changes, the elapsed fraction
 * of the previous delay will be counted as elapsed for the new delay as well.
 *
 * @param fn Function to be called after {@link delay}.
 * @param delay Number representing the time before executing {@link fn} in ms.
 */
export const createTimeout = (fn: () => void, delay: number | Accessor<number>) => {
  if (typeof delay === "number") {
    createBasicTimeout(fn, delay);
    return;
  }

  let done = false;
  let fractionDone = 0;
  let prev = performance.now();
  const callHandlerAndSetDone = () => {
    fn();
    done = true;
  };

  createEffect((prevTimeout?: number) => {
    if (done) return;
    const currTimeout = delay();
    if (prevTimeout) {
      const curr = performance.now();
      fractionDone += (curr - prev) / prevTimeout;
      prev = curr;
    }
    createBasicTimeout(callHandlerAndSetDone, (1 - fractionDone) * currTimeout);
    return currTimeout;
  });
};

/**
 * {@link setInterval} with an optionally reactive delay. If it changes, the elapsed fraction
 * of the previous delay will be counted as elapsed for the first new delay as well.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number or {@link Accessor} containing a number representing
 * the time between executions of {@link fn} in ms.
 */
export const createInterval = (fn: () => void, delay: number | Accessor<number>): void => {
  if (typeof delay === "number") {
    createBasicInterval(fn, delay);
    return;
  }

  let prev = performance.now();
  let fractionDone = 0;
  const [paused, setPaused] = createSignal(false);
  const callHandlerAndSetPrev = () => {
    untrack(fn);
    prev = performance.now();
  };

  createEffect((prevDelay?: number) => {
    if (paused()) {
      createTimeout(
        () => {
          setPaused(false);
          fractionDone = 0;
          callHandlerAndSetPrev();
        },
        () => (1 - fractionDone) * delay()
      );
      return;
    }

    const currDelay = delay();
    if (prevDelay) {
      fractionDone = (performance.now() - prev) / prevDelay;
      if (fractionDone < 1) {
        setPaused(true);
        return;
      } else {
        callHandlerAndSetPrev();
      }
    }

    createBasicInterval(callHandlerAndSetPrev, currDelay);
    return currDelay;
  });
};

/**
 * Like {@link createInterval}, except the timeout only updates between executions.
 *
 * @param handler Function to be called every {@link timeout}
 * @param timeout Number or Function returning a number representing
 * the time between executions of {@link handler} in ms.
 */
export const createTimeoutLoop = (handler: () => void, timeout: number | (() => number)): void => {
  if (typeof timeout === "number") {
    createBasicInterval(handler, timeout);
    return;
  }
  const [currentTimeout, setCurrentTimeout] = createSignal(untrack(timeout));
  createEffect(() =>
    createBasicInterval(() => {
      handler();
      setCurrentTimeout(timeout);
    }, currentTimeout())
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
  createInterval(() => setPolled(fn), timeout);
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
