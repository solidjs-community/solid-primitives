import {
  Accessor,
  createSignal,
  createComputed,
  untrack,
  getOwner,
  onCleanup,
  createMemo,
  runWithOwner
} from "solid-js";
import type { EffectOptions, MemoOptions, Owner } from "solid-js/types/reactive/signal";
import debounce from "@solid-primitives/debounce";
import throttle from "@solid-primitives/throttle";
import { Fn, isFunction } from "@solid-primitives/utils";

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
  const track = createPureReaction(() => {
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
  const track = createPureReaction(fn, options);
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
 * @param value the initial previous value *(in callback)*
 * @param options set computation name for debugging pourposes
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
  value: T,
  options?: MemoOptions<T>
): Accessor<T>;
// no initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  value?: undefined,
  options?: MemoOptions<T>
): Accessor<T>;
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  value?: T,
  options?: MemoOptions<T>
): Accessor<T> {
  let memo: Accessor<T> | undefined;
  /** number of places where the state is being actively observed */
  let listeners = 0;
  /** original root in which the primitive was initially run */
  const owner = getOwner() as Owner;

  // prettier-ignore
  // memo is recreated every time it's being read, and the previous one is derailed
  // memo disables itself once computation happend without anyone listening
  const recreateMemo = () => runWithOwner(owner as Owner, () => {
    memo = createMemo(prev => {
      if (listeners) return calc(prev);
      memo = undefined;
      return prev as T;
    }, value, options);
  });

  // wrapped signal accessor
  return () => {
    if (getOwner()) {
      listeners++;
      onCleanup(() => listeners--);
    }
    if (!memo) recreateMemo();
    return (memo as Accessor<T>)();
  };
}

export type CacheCalculation<Key, Value> = (key: Key, prev: Value | undefined) => Value;
export type CacheKeyAccessor<Key, Value> = (key: Key) => Value;
export type CacheOptions<Value> = MemoOptions<Value> & { size?: number };

/**
 * Custom, lazily-evaluated, cached memo. The caching is based on a `key`, it has to be declared up-front as a reactive source, or passed to the signal access function.
 *
 * @param key a reactive source, that will serve as cache key (later value access for the same key will be taken from cache instead of recalculated)
 * @param calc calculation function returning value to cache. the function is **tracking** - will recalculate when the accessed signals change.
 * @param options set maximum **size** of the cache, or memo options.
 * @returns signal access function
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/memo#createCache
 *
 * @example
 * set the reactive key up-front
 * ```ts
 * const [count, setCount] = createSignal(1)
 * const double = createCache(count, n => n * 2)
 * // access value:
 * double()
 * ```
 * or pass it to the access function (let's accessing different keys in different places)
 * ```ts
 * const double = createCache((n: number) => n * 2)
 * // access with key
 * double(count())
 * ```
 */
export function createCache<Key, Value>(
  key: Accessor<Key>,
  calc: CacheCalculation<Key, Value>,
  options?: CacheOptions<Value>
): Accessor<Value>;
export function createCache<Key, Value>(
  calc: CacheCalculation<Key, Value>,
  options?: CacheOptions<Value>
): CacheKeyAccessor<Key, Value>;
export function createCache<Key, Value>(
  ...args:
    | [key: Accessor<Key>, calc: CacheCalculation<Key, Value>, options?: CacheOptions<Value>]
    | [calc: CacheCalculation<Key, Value>, options?: CacheOptions<Value>]
): CacheKeyAccessor<Key, Value> | Accessor<Value> {
  const cache = new Map<Key, Accessor<Value>>();
  const owner = getOwner() as Owner;

  const key = isFunction(args[1]) ? (args[0] as Accessor<Key>) : undefined,
    calc = isFunction(args[1]) ? args[1] : (args[0] as CacheCalculation<Key, Value>),
    options = typeof args[1] === "object" ? args[1] : typeof args[2] === "object" ? args[2] : {};

  const run: CacheKeyAccessor<Key, Value> = key => {
    if (cache.has(key)) return (cache.get(key) as Accessor<Value>)();
    const memo = runWithOwner(owner, () =>
      createLazyMemo<Value>(prev => calc(key, prev), undefined, options)
    );
    if (options.size === undefined || cache.size < options.size) cache.set(key, memo);
    return memo();
  };

  return key ? () => run(key()) : run;
}
