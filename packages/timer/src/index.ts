import {
  createSignal,
  onCleanup,
  createEffect,
  untrack,
  type Accessor,
  type SignalOptions,
} from "solid-js";
/**
 * Primitives to manage timeout and interval.
 *
 * @module
 */
import { isServer } from "@solidjs/web";

/** A delay in milliseconds, or an {@link Accessor} of one, `false` to disable the timer. */
export type TimeoutSource = number | Accessor<number | false>;

/**
 * Create a timer ({@link setTimeout} or {@link setInterval}) and return a function to clear it.
 * Does not integrate with the reactive lifecycle — the caller is responsible for cleanup.
 *
 * @param fn Function to be called every {@link delay}.
 * @param delay Number representing the time between executions of {@link fn} in ms.
 * @param timer The timer to create: {@link setTimeout} or {@link setInterval}.
 * @returns Function to clear the timer.
 */
export const makeTimer = (
  fn: VoidFunction,
  delay: number,
  timer: typeof setTimeout | typeof setInterval,
): VoidFunction => {
  if (isServer) {
    return () => void 0;
  }
  const id = timer(fn, delay);
  return () => clearInterval(id);
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
    onCleanup(makeTimer(fn, delay, timer));
    return;
  }

  let done = false;
  let prevTime = performance.now();
  let fractionDone = 0;
  let shouldHandleFraction = false;

  const callHandler = () => {
    untrack(fn);
    prevTime = performance.now();
    done = timer === setTimeout;
  };

  createEffect(
    () => delay(),
    (currDelay: number | false, prevDelay?: number | false) => {
      if (done) return;

      if (currDelay === false) {
        if (typeof prevDelay === "number") {
          fractionDone += (performance.now() - prevTime) / prevDelay;
        }
        return;
      }

      if (prevDelay === false) prevTime = performance.now();

      if (shouldHandleFraction) {
        if (typeof prevDelay === "number") {
          fractionDone += (performance.now() - prevTime) / prevDelay;
        }
        prevTime = performance.now();
        if (fractionDone >= 1) {
          fractionDone = 0;
          callHandler();
        } else if (fractionDone > 0) {
          const reconcileDelay = (1 - fractionDone) * currDelay;
          fractionDone = 0;
          let mainId: ReturnType<typeof timer> | undefined;
          const reconcileId = setTimeout(() => {
            shouldHandleFraction = false;
            callHandler();
            if (!done) {
              mainId = timer(callHandler, currDelay);
            }
          }, reconcileDelay);
          return () => {
            clearTimeout(reconcileId);
            if (mainId !== undefined) clearInterval(mainId);
          };
        }
      }

      fractionDone = 0;
      shouldHandleFraction = true;
      if (done) return () => {};
      const id = timer(callHandler, currDelay);
      return () => clearInterval(id);
    },
  );
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
    onCleanup(makeTimer(handler, timeout, setInterval));
    return;
  }
  const [currentTimeout, setCurrentTimeout] = createSignal(untrack(timeout));
  createEffect(
    () => {
      const t = timeout();
      const curr = currentTimeout();
      return curr === false ? t : curr;
    },
    (currTimeout: number | false) => {
      if (currTimeout === false) return () => {};
      const id = setInterval(() => {
        handler();
        setCurrentTimeout(timeout());
      }, currTimeout);
      return () => clearInterval(id);
    },
  );
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
/** {@link createPolled} overload with an explicit initial `value` of a distinct type `I`. */
export function createPolled<T extends P, I = T, P = T>(
  fn: (prev: P | I) => T,
  timeout: TimeoutSource,
  value: I,
  options?: SignalOptions<T>,
): Accessor<T>;
/**
 * Implementation signature for the {@link createPolled} overloads above.
 * @internal
 */
export function createPolled<T>(
  fn: (prev: T | undefined) => T,
  timeout: TimeoutSource,
  value?: T,
  options?: SignalOptions<T>,
): Accessor<T> {
  if (isServer) {
    const v = fn(value);
    return () => v;
  }
  // A derived signal tracking `tick` (the timer) and fn's own reactive deps. It is returned
  // directly: mirroring it into a second signal from an effect would deliver every value one
  // flush late. Reading it after the owner is disposed returns the last value (the timer is
  // cleaned up with the owner, so nothing can invalidate it again).
  const [tick, setTick] = createSignal(0);
  const [polled] = createSignal<T>((prev: T | undefined) => {
    tick();
    return fn(prev !== undefined ? (prev as T) : value);
  }, options);
  createTimer(() => setTick(t => t + 1), timeout, setInterval);
  return polled;
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

/** A delay in milliseconds, or an {@link Accessor} of one. `false`, negative and non-finite delays never fire. */
export type PausableDelay = number | false | Accessor<number | false>;

/** Controls returned by {@link makePausableTimer}. */
export type PausableTimer = {
  /** (Re)start the timer from the full delay. Starting a paused timer discards its remaining time. */
  start: VoidFunction;
  /** Pause a running timer, keeping the remaining time. No-op when not running (idle or already paused). */
  pause: VoidFunction;
  /** Resume a paused timer with the time that was left. No-op unless paused (e.g. after it fired). */
  resume: VoidFunction;
  /** Cancel the timer and return to idle with the full delay remaining. Safe to call repeatedly. */
  stop: VoidFunction;
  /** Alias of {@link PausableTimer.stop}, the manual cleanup. */
  clear: VoidFunction;
  /** Restore the full delay. A running timer restarts, a paused one stays paused, an idle one stays idle. */
  reset: VoidFunction;
  /**
   * Change the delay. The elapsed fraction carries over (like {@link createTimer}):
   * a timer 25% done stays 25% done and fires after 75% of the new delay.
   */
  setDelay: (delay: number | false) => void;
  /** Milliseconds left. Live while running, frozen while paused, full delay when idle, `0` after it fired. */
  remaining: () => number;
  /** `true` while the countdown is running. */
  isActive: () => boolean;
  /** `true` while paused with time left. */
  isPaused: () => boolean;
};

const normalizeDelay = (delay: number | false): number =>
  typeof delay === "number" && delay >= 0 && Number.isFinite(delay) ? delay : Infinity;

const noop = (): void => {};

/**
 * Create a one-shot timeout that remembers its REMAINING time across pause/resume.
 * Does not integrate with the reactive lifecycle — call `stop()` (e.g. via `onCleanup`).
 * Nothing starts until `start()` is called. On the server every control is a no-op.
 *
 * @param fn Called once when the delay has fully elapsed (not counting paused time).
 * @param delay Time in ms. `false`, negative and non-finite values never fire.
 * @example
 * const timer = makePausableTimer(() => dismiss(), 5000);
 * timer.start();
 * timer.pause();   // remaining() is frozen
 * timer.resume();  // fires after what was left, not another 5000ms
 */
export const makePausableTimer = (fn: VoidFunction, delay: number | false): PausableTimer => {
  let total = normalizeDelay(delay);
  if (isServer) {
    return {
      start: noop,
      pause: noop,
      resume: noop,
      stop: noop,
      clear: noop,
      reset: noop,
      setDelay: d => void (total = normalizeDelay(d)),
      remaining: () => total,
      isActive: () => false,
      isPaused: () => false,
    };
  }

  let state: "idle" | "running" | "paused" = "idle";
  let left = total;
  let startedAt = 0;
  let id: ReturnType<typeof setTimeout> | undefined;

  const clearId = () => {
    if (id !== undefined) clearTimeout(id);
    id = undefined;
  };
  const current = () =>
    state === "running" ? Math.max(0, left - (performance.now() - startedAt)) : left;
  const schedule = () => {
    clearId();
    state = "running";
    startedAt = performance.now();
    if (!Number.isFinite(left)) return; // never fires
    id = setTimeout(() => {
      id = undefined;
      state = "idle";
      left = 0;
      fn();
    }, left);
  };

  const stop = () => {
    clearId();
    state = "idle";
    left = total;
  };

  return {
    start() {
      left = total;
      schedule();
    },
    pause() {
      if (state !== "running") return;
      left = current();
      clearId();
      state = "paused";
    },
    resume() {
      if (state === "paused") schedule();
    },
    stop,
    clear: stop,
    reset() {
      left = total;
      if (state === "running") schedule();
    },
    setDelay(next) {
      const nextTotal = normalizeDelay(next);
      if (nextTotal === total) return;
      const wasRunning = state === "running";
      if (state === "idle") left = nextTotal;
      else if (Number.isFinite(total) && Number.isFinite(nextTotal)) {
        left = total === 0 ? 0 : (current() / total) * nextTotal;
      } else left = nextTotal; // crossing to/from "never": start over with the new delay
      total = nextTotal;
      if (wasRunning) schedule();
    },
    remaining: current,
    isActive: () => state === "running",
    isPaused: () => state === "paused",
  };
};

/** Options for {@link createPausableTimer}. */
export type PausableTimerOptions = {
  /** Start counting down on creation. Defaults to `true`. */
  autoStart?: boolean;
  /**
   * Pause while `document.visibilityState === "hidden"` and resume when visible again.
   * Only resumes a pause it caused itself — a manual `pause()` is never undone. Defaults to `false`.
   */
  pauseWhenHidden?: boolean;
};

/** Reactive controls returned by {@link createPausableTimer}. Accessors are signals. */
export type ReactivePausableTimer = Omit<PausableTimer, "setDelay"> & {
  /**
   * Milliseconds left. Re-evaluates whenever the timer changes state (start, pause, resume, reset,
   * delay change, fire); while running, each read returns the live value but does not tick —
   * drive progress UIs with your own `requestAnimationFrame`/interval.
   */
  remaining: Accessor<number>;
  isActive: Accessor<boolean>;
  isPaused: Accessor<boolean>;
};

/**
 * Reactive {@link makePausableTimer}: a one-shot timeout that tracks remaining time across pause/resume,
 * with a reactive delay and automatic cleanup. On the server it is inert.
 *
 * @param fn Called once when the delay has fully elapsed (not counting paused time).
 * @param delay Number or {@link Accessor} in ms. A change carries the elapsed fraction over.
 * @param options {@link PausableTimerOptions}
 * @example
 * // Toast: pause while the user hovers or focuses it
 * const timer = createPausableTimer(dismiss, 5000, { pauseWhenHidden: true });
 * <div onPointerEnter={timer.pause} onPointerLeave={timer.resume}
 *      onFocusIn={timer.pause} onFocusOut={timer.resume}>…</div>
 */
export const createPausableTimer = (
  fn: VoidFunction,
  delay: PausableDelay,
  options: PausableTimerOptions = {},
): ReactivePausableTimer => {
  const read = typeof delay === "function" ? delay : () => delay;
  const [version, setVersion] = createSignal(0, { ownedWrite: true });
  const bump = () => void setVersion(v => v + 1);
  const timer = makePausableTimer(() => {
    untrack(fn);
    bump();
  }, untrack(read));

  const wrap =
    <A extends unknown[]>(f: (...args: A) => void) =>
    (...args: A) => {
      f(...args);
      bump();
    };
  const track =
    <T>(f: () => T): Accessor<T> =>
    () => (version(), f());

  let hiddenPaused = false;
  const pause = wrap(() => {
    hiddenPaused = false; // a manual pause is never auto-resumed
    timer.pause();
  });
  const stop = wrap(() => {
    hiddenPaused = false;
    timer.stop();
  });
  const start = wrap(() => {
    hiddenPaused = false;
    timer.start();
  });

  if (isServer) {
    return {
      start: noop,
      pause: noop,
      resume: noop,
      stop: noop,
      clear: noop,
      reset: noop,
      remaining: () => timer.remaining(),
      isActive: () => false,
      isPaused: () => false,
    };
  }

  onCleanup(timer.stop);
  if (typeof delay === "function") {
    createEffect(
      () => delay(),
      d => {
        timer.setDelay(d);
        bump();
      },
      { defer: true },
    );
  }

  if (options.pauseWhenHidden && typeof document !== "undefined") {
    const sync = () => {
      if (document.visibilityState === "hidden") {
        if (timer.isActive()) {
          timer.pause();
          hiddenPaused = true;
          bump();
        }
      } else if (hiddenPaused) {
        hiddenPaused = false;
        timer.resume();
        bump();
      }
    };
    document.addEventListener("visibilitychange", sync);
    onCleanup(() => document.removeEventListener("visibilitychange", sync));
    if (options.autoStart !== false) {
      timer.start();
      sync();
    }
  } else if (options.autoStart !== false) {
    timer.start();
  }

  return {
    start,
    pause,
    resume: wrap(timer.resume),
    stop,
    clear: stop,
    reset: wrap(timer.reset),
    remaining: track(timer.remaining),
    isActive: track(timer.isActive),
    isPaused: track(timer.isPaused),
  };
};
