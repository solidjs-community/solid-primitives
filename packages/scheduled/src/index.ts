import {
  type Accessor,
  createDeferred,
  createSignal,
  getObserver,
  getOwner,
  isEqual,
  onCleanup,
} from "solid-js";
import { isServer } from "@solidjs/web";

export type ScheduleCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  wait?: number,
) => Scheduled<Args>;

export interface Scheduled<Args extends unknown[]> {
  (...args: Args): void;
  clear: VoidFunction;
}

/**
 * Creates a callback that is debounced and cancellable. The debounced callback is called on **trailing** edge.
 *
 * The timeout will be automatically cleared on root dispose.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce in milliseconds
 * @returns The debounced function
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#debounce
 *
 * @example
 * ```ts
 * const fn = debounce((message: string) => console.log(message), 250);
 * fn('Hello!');
 * fn.clear() // clears a timeout in progress
 * ```
 */
export const debounce: ScheduleCallback = (callback, wait) => {
  if (isServer) {
    return Object.assign(() => void 0, { clear: () => void 0 });
  }
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const clear = () => clearTimeout(timeoutId);
  if (getOwner()) onCleanup(clear);
  const debounced: typeof callback = (...args) => {
    if (timeoutId !== undefined) clear();
    timeoutId = setTimeout(() => callback(...args), wait);
  };
  return Object.assign(debounced, { clear });
};

/**
 * Creates a callback that is throttled and cancellable. The throttled callback is called on **trailing** edge.
 *
 * The timeout will be automatically cleared on root dispose.
 *
 * @param callback The callback to throttle
 * @param wait The duration to throttle
 * @returns The throttled callback trigger
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#throttle
 *
 * @example
 * ```ts
 * const trigger = throttle((val: string) => console.log(val), 250);
 * trigger('my-new-value');
 * trigger.clear() // clears a timeout in progress
 * ```
 */
export const throttle: ScheduleCallback = (callback, wait) => {
  if (isServer) {
    return Object.assign(() => void 0, { clear: () => void 0 });
  }

  let isThrottled = false,
    timeoutId: ReturnType<typeof setTimeout>,
    lastArgs: Parameters<typeof callback>;

  const throttled: typeof callback = (...args) => {
    lastArgs = args;
    if (isThrottled) return;
    isThrottled = true;
    timeoutId = setTimeout(() => {
      // reset first, so a throwing callback or a call made from inside it doesn't leave the throttle stuck
      isThrottled = false;
      callback(...lastArgs);
    }, wait);
  };

  const clear = () => {
    clearTimeout(timeoutId);
    isThrottled = false;
  };
  if (getOwner()) onCleanup(clear);

  return Object.assign(throttled, { clear });
};

/**
 * Creates a callback throttled using `window.requestIdleCallback()`. ([MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback))
 *
 * The throttled callback is called on **trailing** edge.
 *
 * The timeout will be automatically cleared on root dispose.
 *
 * @param callback The callback to throttle
 * @param maxWait maximum wait time in milliseconds until the callback is called
 * @returns The throttled callback trigger
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#scheduleidle
 *
 * @example
 * ```ts
 * const trigger = scheduleIdle((val: string) => console.log(val), 250);
 * trigger('my-new-value');
 * trigger.clear() // clears a timeout in progress
 * ```
 */
export const scheduleIdle: ScheduleCallback = isServer
  ? () => Object.assign(() => void 0, { clear: () => void 0 })
  : // requestIdleCallback is not supported in Safari
    typeof requestIdleCallback !== "undefined"
    ? (callback, maxWait) => {
        let isDeferred = false,
          id: ReturnType<typeof requestIdleCallback>,
          lastArgs: Parameters<typeof callback>;

        const deferred: typeof callback = (...args) => {
          lastArgs = args;
          if (isDeferred) return;
          isDeferred = true;
          id = requestIdleCallback(
            () => {
              isDeferred = false;
              callback(...lastArgs);
            },
            { timeout: maxWait },
          );
        };

        const clear = () => {
          cancelIdleCallback(id);
          isDeferred = false;
        };
        if (getOwner()) onCleanup(clear);

        return Object.assign(deferred, { clear });
      }
    : // fallback to setTimeout (throttle)
      callback => throttle(callback);

/**
 * Creates a scheduled and cancellable callback that will be called on **leading** edge.
 *
 * The timeout will be automatically cleared on root dispose.
 *
 * @param schedule {@link debounce} or {@link throttle}
 * @param callback The callback to debounce/throttle
 * @param wait timeout duration
 * @returns The scheduled callback trigger
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#leading
 *
 * @example
 * ```ts
 * const trigger = leading(throttle, (val: string) => console.log(val), 250);
 * trigger('my-new-value');
 * trigger.clear() // clears a timeout in progress
 * ```
 */
export function leading<Args extends unknown[]>(
  schedule: ScheduleCallback,
  callback: (...args: Args) => void,
  wait?: number,
): Scheduled<Args> {
  if (isServer) {
    let called = false;
    const scheduled = (...args: Args) => {
      if (called) return;
      called = true;
      callback(...args);
    };
    return Object.assign(scheduled, { clear: () => void 0 });
  }

  let isScheduled = false;
  const scheduled = schedule(() => (isScheduled = false), wait);

  const func: typeof callback = (...args) => {
    if (!isScheduled) callback(...args);
    isScheduled = true;
    scheduled();
  };

  const clear = () => {
    isScheduled = false;
    scheduled.clear();
  };
  if (getOwner()) onCleanup(clear);
  return Object.assign(func, { clear });
}

/**
 * Creates a scheduled and cancellable callback that will be called on the **leading** edge for the first call, and **trailing** edge for other calls.
 *
 * The timeout will be automatically cleared on root dispose.
 *
 * @param schedule {@link debounce} or {@link throttle}
 * @param callback The callback to debounce/throttle
 * @param wait timeout duration
 * @returns The scheduled callback trigger
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#leadingAndTrailing
 *
 * @example
 * ```ts
 * const trigger = leadingAndTrailing(throttle, (val: string) => console.log(val), 250);
 * trigger('my-new-value');
 * trigger.clear() // clears a timeout in progress
 * ```
 */
export function leadingAndTrailing<Args extends unknown[]>(
  schedule: ScheduleCallback,
  callback: (...args: Args) => void,
  wait?: number,
): Scheduled<Args> {
  if (isServer) {
    let called = false;
    const scheduled = (...args: Args) => {
      if (called) return;
      called = true;
      callback(...args);
    };
    return Object.assign(scheduled, { clear: () => void 0 });
  }

  const enum State {
    Ready, // 0 - default state, not scheduled
    Leading, // 1 - scheduled, called leading edge, triggered only once
    Trailing, // 2 - triggered more than once, will be called on trailing edge
  }

  let state = State.Ready;

  const scheduled = schedule((args: Args) => {
    const isTrailing = state === State.Trailing;
    // reset first, so a throwing callback or a trigger call made from inside it isn't lost
    state = State.Ready;
    isTrailing && callback(...args);
  }, wait);

  const fn: typeof callback = (...args) => {
    if (state !== State.Trailing) {
      if (state === State.Ready) callback(...args);
      state += 1;
    }
    scheduled(args);
  };

  const clear = () => {
    state = State.Ready;
    scheduled.clear();
  };
  if (getOwner()) onCleanup(clear);

  return Object.assign(fn, { clear });
}

/**
 * Creates a signal used for scheduling execution of solid computations by tracking.
 *
 * @param schedule Schedule the invalidate function (can be {@link debounce} or {@link throttle})
 * @returns A function used to track the signal. It returns `true` if the signal is dirty *(callback should be called)* and `false` otherwise.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#createScheduled
 *
 * @example
 * ```ts
 * const debounced = createScheduled(fn => debounce(fn, 250));
 *
 * createEffect(
 *   () => count(), // compute: track source signal
 *   value => {
 *     // apply: runs after scheduled invalidation
 *     if (debounced()) {
 *       console.log('count', value);
 *     }
 *   }
 * );
 * ```
 */

// Thanks to Fabio Spampinato (https://github.com/fabiospampinato) for the idea for the primitive

export function createScheduled(
  schedule: (callback: VoidFunction) => VoidFunction,
): Accessor<boolean> {
  let listeners = 0;
  let isDirty = false;
  // ownedWrite: true allows dirty() to be called synchronously from within a
  // reactive computation's compute phase (e.g. when using leading edge schedules).
  const [track, dirty] = createSignal(void 0, { equals: false, ownedWrite: true });
  const call = schedule(() => {
    isDirty = true;
    dirty();
  });
  return (): boolean => {
    if (!isDirty) (call(), track());

    if (isDirty) {
      isDirty = !!listeners;
      return true;
    }

    if (getObserver()) {
      listeners++;
      onCleanup(() => listeners--);
    }

    return false;
  };
}

// ---- Derived scheduled accessors ----

/**
 * Whether to emit on the leading edge, the trailing edge, or both.
 */
export type ScheduleEdgeOptions =
  | {
      /** Emit the first change immediately. Defaults to `false`. */
      leading?: false;
      /** Emit the latest value at the end of the window. Defaults to `true`. */
      trailing?: true;
    }
  | {
      /** Emit the first change immediately. */
      leading: true;
      /** Emit the latest value at the end of the window. Defaults to `true`. */
      trailing?: boolean;
    };

/**
 * Maximum time a debounced value may be held back while changes continue.
 */
export type MaxWaitOptions = {
  /**
   * Maximum time to hold the value back, in milliseconds. Without this, a
   * continuous stream of changes can defer the landing indefinitely.
   */
  maxWait?: number;
};

/**
 * Creates an accessor whose value is **debounced** on the trailing edge.
 *
 * A change is held back until the source has been quiet for `wait` milliseconds.
 * While it is held back readers keep the last value and `isPending()` is `true`;
 * the initial value is available synchronously.
 *
 * @param source The reactive value to debounce
 * @param wait The debounce duration in milliseconds
 * @param options {@link ScheduleEdgeOptions} and optional {@link MaxWaitOptions}
 * @returns An accessor with the debounced value
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#createdebounced
 *
 * @example
 * ```ts
 * const debouncedQuery = createDebounced(query, 250);
 *
 * createEffect(
 *   () => debouncedQuery(),
 *   value => fetchResults(value),
 * );
 * ```
 */
export function createDebounced<T>(
  source: Accessor<T>,
  wait: number,
  options?: ScheduleEdgeOptions & MaxWaitOptions,
): Accessor<T> {
  return createScheduledAccessor(
    source,
    emit => debounce(emit, wait),
    options?.leading ?? false,
    options?.trailing ?? true,
    options?.maxWait,
  );
}

/**
 * Creates an accessor whose value is **throttled** on the trailing edge.
 *
 * The first change opens a fixed window of `wait` milliseconds. Changes during
 * that window are coalesced into its trailing value and don't reset the timer.
 * While the value is held back readers keep the last value and `isPending()` is
 * `true`.
 *
 * @param source The reactive value to throttle
 * @param wait The throttle duration in milliseconds
 * @param options {@link ScheduleEdgeOptions}
 * @returns An accessor with the throttled value
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#createthrottled
 *
 * @example
 * ```ts
 * const throttledScroll = createThrottled(scrollY, 100);
 * ```
 */
export function createThrottled<T>(
  source: Accessor<T>,
  wait: number,
  options?: ScheduleEdgeOptions,
): Accessor<T> {
  return createScheduledAccessor(
    source,
    emit => throttle(emit, wait),
    options?.leading ?? false,
    options?.trailing ?? true,
  );
}

type TriggerFactory = (emit: (value: any) => void) => Scheduled<any[]>;

function createScheduledAccessor<T>(
  source: Accessor<T>,
  createTrigger: TriggerFactory,
  leading: boolean,
  trailing: boolean,
  maxWait?: number,
): Accessor<T> {
  if (!leading && !trailing) {
    throw new Error("at least one of `leading` or `trailing` must be true");
  }

  let first = true;
  let windowOpen = false;
  let resolve: ((value: T) => void) | undefined;
  let latest!: T;
  let maxTimer: ReturnType<typeof setTimeout> | undefined;

  const clearMaxWait = (): void => {
    if (maxTimer !== undefined) clearTimeout(maxTimer);
    maxTimer = undefined;
  };

  const emit = (value: T): void => {
    windowOpen = false;
    clearMaxWait();
    const settle = resolve;
    resolve = undefined;
    settle?.(value);
  };

  const trigger = createTrigger(emit);

  // `maxWait` is layered on top of the base debounce/throttle timer: when it
  // fires it settles the current pending promise and resets the window.
  const armMaxWait = (value: T): void => {
    if (!trailing || maxWait === undefined) return;
    latest = value;
    if (maxTimer !== undefined) return;
    maxTimer = setTimeout(() => {
      maxTimer = undefined;
      trigger.clear();
      emit(latest);
    }, maxWait);
  };

  const cleanup = (): void => {
    windowOpen = false;
    clearMaxWait();
    resolve = undefined;
    trigger.clear();
  };

  const accessor = createDeferred<T>((prev?: T) => {
    let value: T;
    try {
      value = source();
    } catch (error) {
      cleanup();
      throw error;
    }

    if (isServer) return value;

    if (first) {
      first = false;
      return value;
    }

    if (isEqual(value, prev)) {
      clearMaxWait();
      resolve = undefined;
      return value;
    }

    const opening = !windowOpen;
    if (opening) windowOpen = true;
    armMaxWait(value);
    trigger(value);

    if (opening && leading) return value;
    if (!trailing) return prev as T;

    return new Promise<T>(settle => {
      resolve = settle;
    });
  });

  if (getOwner()) onCleanup(cleanup);
  return accessor;
}
