/**
 * Creates a method that is throttled and cancellable.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce
 * @returns The throttled callback trigger
 * 
 * @example
 * ```ts
 * const [trigger, clear] = createThrottle(() => console.log('hi'), 250));
 * trigger('my-new-value');
 * console.log(value());
 * ```
 */
const createThrottle = <T extends (...args: any[]) => void>(
  func: T,
  wait?: number
): [
  trigger: (...args: Parameters<T>) => void,
  clear: () => void
] => {
  let timeoutId: number | undefined;
  const clear = () => clearTimeout(timeoutId);
  const trigger = (...args: Parameters<T>) => {
    if (timeoutId === undefined) {
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = undefined;
      }, wait);
    }
  };
  return [trigger, clear];
};

export default createThrottle;
