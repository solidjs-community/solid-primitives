import { onCleanup } from "solid-js";

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
const createDebounce = <T extends (...args: unknown[]) => void, A = Parameters<T>>(
  func: T,
  wait?: number
): [fn: (...args: A extends unknown[] ? A : never) => void, clear: () => void] => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const clear = () => clearTimeout(timeoutId);
  onCleanup(clear);
  return [
    (...args: A extends unknown[] ? A : never) => {
      if (timeoutId !== undefined) clear();
      timeoutId = setTimeout(() => func(...args), wait);
    },
    clear
  ];
};

export default createDebounce;
