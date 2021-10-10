/**
 * Creates a method that is debounced and cancellable.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce
 * @returns The debounced function
 *
 * @example
 * ```ts
 * const [fn, clear] = createDebounce(() => console.log('hi'), 250));
 * fn('my-new-value');
 * ```
 */
const createDebounce = <T extends (...args: any[]) => void>(
  func: T,
  wait?: number
): [
  fn: T,
  clear: () => void
] => {
  let timeoutId: NodeJS.Timer;
  const clear = () => clearTimeout(timeoutId)
  return [
    (...args: Parameters<T>) => {
      if (timeoutId !== undefined) clear();
      timeoutId = setTimeout(() => func(...args), wait);
    },
    clear
  ];
};

export default createDebounce;
