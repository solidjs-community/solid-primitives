import { Accessor, createSignal, getListener, getOwner, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

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
      callback(...lastArgs);
      isThrottled = false;
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
  (window.requestIdleCallback as typeof window.requestIdleCallback | undefined)
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
            callback(...lastArgs);
            isDeferred = false;
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
    state === State.Trailing && callback(...args);
    state = State.Ready;
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
 * createEffect(() => {
 *   // track source signal
 *   const value = count();
 *   // track the debounced signal and check if it's dirty
 *   if (debounced()) {
 *     console.log('count', value);
 *   }
 * });
 * ```
 */

// Thanks to Fabio Spampinato (https://github.com/fabiospampinato) for the idea for the primitive

export function createScheduled(
  schedule: (callback: VoidFunction) => VoidFunction,
): Accessor<boolean> {
  let listeners = 0;
  let isDirty = false;
  const [track, dirty] = createSignal(void 0, { equals: false });
  const call = schedule(() => {
    isDirty = true;
    dirty();
  });
  return (): boolean => {
    if (!isDirty) call(), track();

    if (isDirty) {
      isDirty = !!listeners;
      return true;
    }

    if (getListener()) {
      listeners++;
      onCleanup(() => listeners--);
    }

    return false;
  };
}
