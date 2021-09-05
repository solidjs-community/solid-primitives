/**
 * Creates a method that is debounced and cancellable.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce
 * @returns The debounced callback trigger
 *
 * @example
 * ```ts
 * const [trigger, clear] = createDebounce(() => console.log('hi'), 250));
 * trigger('my-new-value');
 * console.log(value());
 * ```
 */
const createDebounce = <T extends (...args: any[]) => void>(
  func: T,
  wait?: number
): readonly [
  trigger: (...args: Parameters<T>) => void,
  clear: () => void
] => {
  let timeoutId: number | undefined;
  const clear = () => clearTimeout(timeoutId);
  const trigger = (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clear();
    }
    // @ts-ignore
    timeoutId = setTimeout(() => func(...args), wait);
  };
  return [trigger, clear];
};

export default createDebounce;
