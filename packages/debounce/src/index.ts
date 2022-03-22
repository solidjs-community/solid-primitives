import { onCleanup } from "solid-js";

export interface DebouncedFunction<Args extends any[], F extends (...args: Args) => any> {
  (this: ThisParameterType<F>, ...args: Args & Parameters<F>): Promise<ReturnType<F>>;
  cancel: (reason?: any) => void;
}

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
export function createDebounce<Args extends any[], F extends (...args: Args) => void>(
  func: F,
  wait?: number
): F & { clear: () => void } {
  let timeoutId: ReturnType<typeof setTimeout>;
  const clear = () => clearTimeout(timeoutId);
  onCleanup(clear);
  const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (timeoutId !== undefined) clear();
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
  return Object.assign(debounced, { clear }) as F & { clear: () => void };
}

export default createDebounce;
