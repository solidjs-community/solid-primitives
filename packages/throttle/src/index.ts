/**
 * Creates a method that is throttled and cancellable.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce
 * @returns The throttled callback trigger
 *
 * @example
 * ```ts
 * const [trigger, clear] = createThrottle((val) => console.log(val), 250));
 * trigger('my-new-value');
 * ```
 */
const createThrottle = <T extends (...args: any[]) => void>(func: T, wait: number): [
  fn: T,
  clear: () => void
] => {
  let shouldThrottle: boolean = false,
    timerId: NodeJS.Timer;
  return [
    // @ts-ignore
    (...args: Parameters<T>) => {
      // Reject calls during the throttle period
      if (shouldThrottle) {
        return;
      }
      shouldThrottle = true;
      timerId = setTimeout(() => {
        func(...args);
        shouldThrottle = false;
      }, wait);
    },
    () => clearTimeout(timerId)
  ];
};

export default createThrottle;
