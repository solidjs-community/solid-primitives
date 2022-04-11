import { onCleanup } from "solid-js";

export interface DebouncedFunction<Args extends any[]> {
  (...args: Args): void;
  clear: () => void;
}

/**
 * Creates a method that is debounced and cancellable.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce in milliseconds
 * @returns The debounced function
 *
 * @example
 * ```ts
 * const fn = createDebounce((message: string) => console.log(message), 250));
 * fn('Hello!');
 * fn.clear() // clears a timeout in progress
 * ```
 */
export function createDebounce<Args extends any[]>(
  func: (...args: Args) => void,
  wait?: number
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const clear = () => clearTimeout(timeoutId);
  onCleanup(clear);
  const debounced = function (...args: Args) {
    if (timeoutId !== undefined) clear();
    timeoutId = setTimeout(() => func(...args), wait);
  };
  return Object.assign(debounced, { clear }) as DebouncedFunction<Args>;
}

export default createDebounce;
