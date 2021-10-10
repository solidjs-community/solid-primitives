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
const createThrottle = <T extends (...args: any[]) => void, A = Parameters<T>>(
  func: T,
  wait: number
): [
  fn: (...args: A extends any[] ? A : never) => void,
  clear: () => void
] => {
  let shouldThrottle: boolean = false,
    timerId: ReturnType<typeof setTimeout>;
  return [
    (...args: A extends any[] ? A : never) => {
      // Reject calls during the throttle period
      if (shouldThrottle) return;
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
