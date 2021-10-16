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
const createDebounce = <T extends (...args: any[]) => void, A = Parameters<T>>(
  func: T,
  wait?: number
): [fn: (...args: A extends any[] ? A : never) => void, clear: () => void] => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const clear = () => clearTimeout(timeoutId);
  return [
    (...args: A extends any[] ? A : never) => {
      if (timeoutId !== undefined) clear();
      setTimeout(() => func(...args), wait);
    },
    clear
  ];
};

export default createDebounce;
