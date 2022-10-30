import { getOwner, onCleanup } from "solid-js";

export type ScheduleCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  wait?: number
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
 * @example
 * ```ts
 * const fn = debounce((message: string) => console.log(message), 250);
 * fn('Hello!');
 * fn.clear() // clears a timeout in progress
 * ```
 */
export const debounce: ScheduleCallback = (callback, wait) => {
  if (process.env.SSR) {
    return Object.assign(() => void 0, { clear: () => void 0 });
  }
  let timeoutId: ReturnType<typeof setTimeout>;
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
 * @example
 * ```ts
 * const trigger = throttle((val: string) => console.log(val), 250);
 * trigger('my-new-value');
 * trigger.clear() // clears a timeout in progress
 * ```
 */
export const throttle: ScheduleCallback = (callback, wait) => {
  if (process.env.SSR) {
    return Object.assign(() => void 0, { clear: () => void 0 });
  }

  let isThrottled: boolean = false,
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

  const clear = () => clearTimeout(timeoutId);
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
 * @example
 * ```ts
 * const trigger = scheduleIdle((val: string) => console.log(val), 250);
 * trigger('my-new-value');
 * trigger.clear() // clears a timeout in progress
 * ```
 */
export const scheduleIdle: ScheduleCallback = process.env.SSR
  ? () => Object.assign(() => void 0, { clear: () => void 0 })
  : (window.requestIdleCallback as typeof window.requestIdleCallback | undefined)
  ? (callback, maxWait) => {
      if (process.env.SSR) {
        return Object.assign(() => void 0, { clear: () => void 0 });
      }

      let isDeferred: boolean = false,
        id: ReturnType<typeof requestIdleCallback>,
        lastArgs: Parameters<typeof callback>;

      const throttled: typeof callback = (...args) => {
        lastArgs = args;
        if (isDeferred) return;
        isDeferred = true;
        id = requestIdleCallback(
          () => {
            callback(...lastArgs);
            isDeferred = false;
          },
          { timeout: maxWait }
        );
      };

      const clear = () => cancelIdleCallback(id);
      if (getOwner()) onCleanup(clear);

      return Object.assign(throttled, { clear });
    }
  : callback => throttle(callback);

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
  wait?: number
): Scheduled<Args> {
  if (process.env.SSR) {
    let called = false;
    const scheduled = (...args: Args) => {
      if (called) return;
      called = true;
      callback(...args);
    };
    return Object.assign(scheduled, { clear: () => void 0 });
  }

  let isScheduled = false;
  const onTrail = () => (isScheduled = false);
  const scheduled = schedule(onTrail, wait);
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
