import {
  Accessor,
  createReaction,
  createSignal,
  createComputed,
  untrack,
  getOwner,
  onCleanup,
  runWithOwner
} from "solid-js";
import type { EffectOptions, MemoOptions, Owner } from "solid-js/types/reactive/signal";
import debounce from "@solid-primitives/debounce";
import throttle from "@solid-primitives/throttle";
import { Fn } from "@solid-primitives/utils";

export type MemoOptionsWithValue<T> = MemoOptions<T> & { value?: T };
export type AsyncMemoCalculation<T, Init = undefined> = (prev: T | Init) => Promise<T> | T;

/**
 * Solid's `createReaction` that is based on pure computation *(runs before render, and is non-batching)*
 *
 * @param onInvalidate callback that runs when the tracked sources trigger update
 * @param options set computation name for debugging pourposes
 * @returns track() function
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memo#createPureReaction
 *
 * @example
 * const [count, setCount] = createSignal(0);
 * const track = createPureReaction(() => {...});
 * track(count);
 * setCount(1); // triggers callback
 *
 * // sources need to be re-tracked every time
 * setCount(2); // doesn't trigger callback
 */
export function createPureReaction(
  onInvalidate: Fn,
  options?: EffectOptions
): (tracking: Fn) => void {
  // current sources tracked by the user
  const [trackedList, setTrackedList] = createSignal<Fn[]>([]);
  let addedTracked = false;

  createComputed(() => {
    // subs to trackedList signal
    if (!trackedList().length) return;

    // computation triggered by calling track()
    if (addedTracked) {
      addedTracked = false;
      // subs to trackedList's items
      trackedList().forEach(tracking => tracking());
    }
    // computation triggered by tracked sources
    else {
      setTrackedList([]);
      untrack(onInvalidate);
    }
  }, options);

  // track()
  return tracking => {
    addedTracked = true;
    setTrackedList(p => [...p, tracking]);
  };
}

/**
 * Solid's `createMemo` which returned signal is debounced.
 *
 * @param calc reactive calculation returning signals value
 * @param timeoutMs The duration to debounce in ms
 * @param options specify initial value *(by default it will be undefined)*
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memo#createDebouncedMemo
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
  options: MemoOptionsWithValue<T | undefined> = {}
): Accessor<T> {
  const [state, setState] = createSignal(options.value, options);
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
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memo#createThrottledMemo
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
  options: MemoOptionsWithValue<T | undefined> = {}
): Accessor<T> {
  const [state, setState] = createSignal(options.value, options);
  const [fn] = throttle(() => track(() => setState(calc)), timeoutMs);
  const track = createReaction(fn, options);
  track(() => setState(calc));
  return state as Accessor<T>;
}

/**
 * Solid's `createMemo` that allows for asynchronous calculations.
 *
 * @param calc reactive calculation returning a promise
 * @param options specify initial value *(by default it will be undefined)*
 * @returns signal of values resolved from running calculations
 *
 * **calculation will track reactive reads synchronously — untracks after first `await`**
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memo#createAsyncMemo
 *
 * @example
 * const memo = createAsyncMemo(async prev => {
 *    const value = await myAsyncFunc(signal())
 *    return value.data
 * }, { value: 'initial value' })
 */
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T, T>,
  options: MemoOptionsWithValue<T> & { value: T }
): Accessor<T>;
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T>,
  options?: MemoOptionsWithValue<T>
): Accessor<T | undefined>;
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T>,
  options: MemoOptionsWithValue<T | undefined> = {}
): Accessor<T | undefined> {
  const [state, setState] = createSignal(options.value, options);
  /** pending promises from oldest to newest */
  const order: Promise<T>[] = [];

  // prettier-ignore
  createComputed(async () => {
    const value = calc(untrack(state));
    if (value instanceof Promise) {
      order.push(value);
      // resolved value will only be written to the signal,
      // if the promise wasn't removed from the array
      value.then(r => order.includes(value) && setState(() => r))
      // when a promise finishes, it removes itself, and every older promise from array,
      // blocking them from overwriting the state if they finish after
      value.finally(() => {
        const index = order.indexOf(value);
        order.splice(0, index + 1);
      });
    }
    else setState(() => value);
  }, undefined, options);

  return state;
}

/**
 * Lazily evaluated `createMemo`. Will run the calculation only if is being listened to.
 *
 * @param calc pure reactive calculation returning some value
 * @param options for configuring initial state: *(before first read)*
 * - `value` - initial value of the signal
 * @returns signal of a value that was returned by the calculation
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memo#createLazyMemo
 *
 * @example
 * const double = createLazyMemo(() => count() * 2)
 */

// initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T) => T,
  options: MemoOptionsWithValue<T> & { value: T }
): Accessor<T>;
// no initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options?: MemoOptionsWithValue<T>
): Accessor<T>;
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options: MemoOptionsWithValue<T | undefined> = {}
): Accessor<T> {
  let signal: Accessor<T>;
  let run: () => void;

  /** number of places where the state is being actively observed */
  let listeners = 0;
  /** is the reaction tracking enabled */
  let isTracking = false;
  /** original root in which the primitive was initially run */
  const owner = getOwner();

  // wrapped signal accessor
  return () => {
    // this will run on the first access (only)
    if (!signal) {
      // TODO: rewrite lazy memo to use pure computation (createReaction is an effect)
      const track = runWithOwner(owner as Owner, () => createReaction(() => run()));
      run = () => {
        if (listeners) {
          isTracking = true;
          track(() => setState((prev: T | undefined) => calc(prev)));
        } else isTracking = false;
      };
      // prettier-ignore
      // on the initial access, signal's value is calculated only once, here:
      // (which kicks off tracking)
      const [state, setState] = createSignal((() => {
         let v!: T;
         track(() => (v = calc(options.value ?? undefined)));
         return v;
       })(), options);
      signal = state;
      isTracking = true;
    }

    if (getOwner()) {
      listeners++;
      onCleanup(() => listeners--);
      isTracking || run();
    }

    return signal();
  };
}
