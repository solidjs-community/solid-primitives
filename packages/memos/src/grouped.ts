import { Accessor, createReaction, createSignal } from "solid-js";
import debounce from "@solid-primitives/debounce";
import throttle from "@solid-primitives/throttle";
import { MemoOptionsWithValue } from ".";

/**
 * Solid's `createMemo` which returned signal is debounced.
 *
 * @param calc reactive calculation returning signals value
 * @param timeoutMs The duration to debounce in ms
 * @param options specify initial value *(by default it will be undefined)*
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memos#createDebouncedMemo
 *
 * @example
 * const double = createDebouncedMemo(() => count() * 2, 200)
 */
export function createDebouncedMemo<T>(
  calc: (prev: T) => T,
  timeoutMs: number,
  options: MemoOptionsWithValue<T> & { value: T }
): Accessor<T>;
export function createDebouncedMemo<T>(
  calc: (prev: T | undefined) => T,
  timeoutMs: number,
  options?: MemoOptionsWithValue<T>
): Accessor<T>;
export function createDebouncedMemo<T>(
  calc: (prev: T | undefined) => T,
  timeoutMs: number,
  options?: MemoOptionsWithValue<T>
): Accessor<T> {
  const [state, setState] = createSignal<T | undefined>(options?.value);
  const [fn] = debounce(() => track(() => setState(calc)), timeoutMs);
  const track = createReaction(() => {
    fn();
    track(() => calc(state()));
  }, options);
  track(() => setState(calc));
  return state as Accessor<T>;
}

/**
 * Solid's `createMemo` which returned signal is throttled.
 *
 * @param calc reactive calculation returning signals value
 * @param timeoutMs The duration to throttle in ms
 * @param options specify initial value *(by default it will be undefined)*
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memos#createThrottledMemo
 *
 * @example
 * const double = createThrottledMemo(() => count() * 2, 200)
 */
export function createThrottledMemo<T>(
  calc: (prev: T) => T,
  timeoutMs: number,
  options: MemoOptionsWithValue<T> & { value: T }
): Accessor<T>;
export function createThrottledMemo<T>(
  calc: (prev: T | undefined) => T,
  timeoutMs: number,
  options?: MemoOptionsWithValue<T>
): Accessor<T>;
export function createThrottledMemo<T>(
  calc: (prev: T | undefined) => T,
  timeoutMs: number,
  options?: MemoOptionsWithValue<T>
): Accessor<T> {
  const [state, setState] = createSignal<T | undefined>(options?.value);
  const [fn] = throttle(() => track(() => setState(calc)), timeoutMs);
  const track = createReaction(fn, options);
  track(() => setState(calc));
  return state as Accessor<T>;
}
