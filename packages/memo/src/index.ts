import {
  type Accessor,
  createSignal,
  untrack,
  getOwner,
  onCleanup,
  createMemo,
  createReaction,
  runWithOwner,
  type Setter,
  type ComputeFunction,
  type NoInfer,
  type Owner,
  type SignalOptions,
  DEV,
} from "solid-js";

type MemoOptions<T> = {
  name?: string;
  equals?: false | ((prev: T, next: T) => boolean);
};
import { isServer } from "@solidjs/web";
import { type EffectOptions, EQUALS_FALSE_OPTIONS } from "@solid-primitives/utils";

const callbackWith = <A, T>(fn: (a: A) => T, v: Accessor<A>): (() => T) =>
  fn.length > 0 ? () => fn(untrack(v)) : (fn as () => T);

/**
 * Solid's `createReaction` that is based on pure computation *(runs before render, and is non-batching)*
 *
 * @param onInvalidate callback that runs when the tracked sources trigger update
 * @param options set computation name for debugging pourposes
 * - `options.initial` — an array of functions to be run initially and tracked. *(useful for runing code before other pure computations)*
 * @returns track() function
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/memo#createPureReaction
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
  onInvalidate: VoidFunction,
  options?: EffectOptions,
): (tracking: VoidFunction) => void {
  if (isServer) {
    return () => void 0;
  }

  const owner = getOwner()!;
  let trackers = 0;
  let disposed = false;
  onCleanup(() => {
    disposed = true;
  });

  // track()
  return tracking => {
    if (disposed) {
      untrack(tracking);
      return;
    }
    trackers++;
    const r = runWithOwner(owner, () =>
      createReaction(() => {
        if (--trackers === 0) untrack(onInvalidate);
      }, options),
    )!;
    r(tracking);
  };
}

/**
 * A combined memo of multiple sources, last updated source will be the value of the returned signal.
 * @param sources list of reactive calculations/signals/memos
 * @param options signal options
 * @returns signal with value of the last updated source
 * @example
 * const [count, setCount] = createSignal(1);
 * const [text, setText] = createSignal("hello");
 * const lastUpdated = createLatest([count, text]);
 * lastUpdated() // => "hello"
 * setCount(4)
 * lastUpdated() // => 4
 */
export function createLatest<T extends readonly Accessor<any>[]>(
  sources: T,
  options?: MemoOptions<ReturnType<T[number]>>,
): Accessor<ReturnType<T[number]>> {
  let index = 0;
  const memos = sources.map((source, i) =>
    createMemo(
      () => ((index = i), source()),
      DEV ? { name: i + 1 + ". source", equals: false } : EQUALS_FALSE_OPTIONS,
    ),
  );
  return createMemo(() => memos.map(m => m())[index]!, options);
}

/**
 * A combined memo of multiple sources, returns the values of sources updated in the last tick.
 * @param sources list of reactive calculations/signals/memos
 * @param options signal options
 * @returns signal with value of the last updated sources
 * @example
 * const [count, setCount] = createSignal(1);
 * const [text, setText] = createSignal("hello");
 * const lastUpdated = createLatest([count, text]);
 * lastUpdated() // => [1, "hello"]
 * setCount(4)
 * lastUpdated() // => [4]
 */
export function createLatestMany<T extends readonly Accessor<any>[]>(
  sources: T,
  options?: EffectOptions,
): Accessor<ReturnType<T[number]>[]>;
export function createLatestMany<T>(
  sources: readonly Accessor<T>[],
  options?: EffectOptions,
): Accessor<T[]> {
  const memos = sources.map((source, i) => {
    const obj = { dirty: true, get: null as any as Accessor<T> };

    obj.get = createMemo(
      () => ((obj.dirty = true), source()),
      DEV ? { name: i + 1 + ". source", equals: false } : EQUALS_FALSE_OPTIONS,
    );

    return obj;
  });

  return createLazyMemo<T[]>(
    () =>
      memos.reduce((acc: T[], memo) => {
        // always track all memos to force updates
        const v = memo.get();
        if (memo.dirty) {
          memo.dirty = false;
          acc.push(v);
        }
        return acc;
      }, []),
    undefined,
    options,
  );
}

/**
 * Solid's `createMemo` which value can be overwritten by a setter. Signal value will be the last one, set by a setter or a memo calculation.
 * @param fn callback that calculates the value
 * @param value initial value (for calcultion)
 * @param options give a name to the reactive computation, or change `equals` method.
 * @returns signal returning value of the last change.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/memo#createWritableMemo
 * @example
 * const [count, setCount] = createSignal(1);
 * const [result, setResult] = createWritableMemo(() => count() * 2);
 * setResult(5) // overwrites calculation result
 */
export function createWritableMemo<Next extends Prev, Prev = Next>(
  fn: ComputeFunction<undefined | NoInfer<Prev>, Next>,
): [signal: Accessor<Next>, setter: Setter<Next>];
export function createWritableMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: ComputeFunction<Init | Prev, Next>,
  value: Init,
  options?: MemoOptions<Next>,
): [signal: Accessor<Next>, setter: Setter<Next>];
export function createWritableMemo<T>(
  fn: (prev: T | undefined) => T,
  value?: T,
  options?: MemoOptions<T | undefined>,
): [signal: Accessor<T>, setter: Setter<T>] {
  let combined: Accessor<T> = () => value as T;

  const [signal, setSignal] = createSignal(value as Exclude<T, Function>, { equals: false, ownedWrite: true }),
    memo = createMemo(
      callbackWith(fn, () => combined()),
      EQUALS_FALSE_OPTIONS,
    );

  return [
    (combined = createLatest([signal, memo], options)),
    ((setter: any): T =>
      setSignal(() =>
        typeof setter === "function" ? setter(untrack(combined)) : setter,
      )) as Setter<T>,
  ];
}

/**
 * Lazily evaluated `createMemo`. Will run the calculation only if is being listened to.
 *
 * @param calc pure reactive calculation returning some value
 * @param value the initial previous value *(in callback)*
 * @param options set computation name for debugging pourposes
 * @returns signal of a value that was returned by the calculation
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/memo#createLazyMemo
 *
 * @example
 * const double = createLazyMemo(() => count() * 2)
 */
export function createLazyMemo<T>(
  calc: (prev: T) => T,
  value: T,
  options?: EffectOptions,
): Accessor<T>;

export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  value?: undefined,
  options?: EffectOptions,
): Accessor<T>;

export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  value?: T,
  options?: EffectOptions,
): Accessor<T> {
  if (isServer) {
    let calculated = false;
    return () => {
      if (!calculated) {
        calculated = true;
        value = calc(value);
      }
      return value as T;
    };
  }

  let prevValue: T | undefined = value;

  return createMemo<T>(
    (): T => {
      prevValue = calc(prevValue);
      return prevValue;
    },
    DEV ? { lazy: true, name: options?.name, equals: false } : { lazy: true, equals: false },
  ) as Accessor<T>;
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
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/memo#createMemoCache
 *
 * @example
 * set the reactive key up-front
 * ```ts
 * const [count, setCount] = createSignal(1)
 * const double = createMemoCache(count, n => n * 2)
 * // access value:
 * double()
 * ```
 * or pass it to the access function (let's accessing different keys in different places)
 * ```ts
 * const double = createMemoCache((n: number) => n * 2)
 * // access with key
 * double(count())
 * ```
 */
export function createMemoCache<Key, Value>(
  key: Accessor<Key>,
  calc: CacheCalculation<Key, Value>,
  options?: CacheOptions<Value>,
): Accessor<Value>;
export function createMemoCache<Key, Value>(
  calc: CacheCalculation<Key, Value>,
  options?: CacheOptions<Value>,
): CacheKeyAccessor<Key, Value>;
export function createMemoCache<Key, Value>(
  ...args:
    | [key: Accessor<Key>, calc: CacheCalculation<Key, Value>, options?: CacheOptions<Value>]
    | [calc: CacheCalculation<Key, Value>, options?: CacheOptions<Value>]
): CacheKeyAccessor<Key, Value> | Accessor<Value> {
  const cache = new Map<Key, Accessor<Value>>();
  const owner = getOwner() as Owner;

  const key = typeof args[1] === "function" ? (args[0] as Accessor<Key>) : undefined,
    calc = typeof args[1] === "function" ? args[1] : (args[0] as CacheCalculation<Key, Value>),
    options = typeof args[1] === "object" ? args[1] : typeof args[2] === "object" ? args[2] : {};

  const run: CacheKeyAccessor<Key, Value> = key => {
    if (cache.has(key)) return (cache.get(key) as Accessor<Value>)();
    let prevVal: Value | undefined;
    const memo = runWithOwner(owner, () =>
      createMemo<Value>((): Value => {
        const v = calc(key, prevVal);
        prevVal = v;
        return v;
      }, options),
    )!;
    if (options.size === undefined || cache.size < options.size) cache.set(key, memo);
    return memo();
  };

  return key ? () => run(key()) : run;
}

/**
 * Primitive for updating signal in a predictable way. SolidJS equivalent of React's [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer).
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/memo#createReducer
 * @param dispatcher is the reducer, it's 1st parameter always is the current state of the reducer and it returns the new state of the reducer.
 * @param initialValue initial value of the signal
 * @returns
 * ```ts
 * [accessor: Accessor<State>, dispatch: (...args: ActionData) => void]
 * ```
 * - `accessor` can be used as you use a normal signal: `accessor()`. It contains the state of the reducer.
 * - `dispatch` is the action of the reducer, it is a sort of `setSignal` that does NOT receive the new state, but instructions to create it from the current state.
 */
export function createReducer<T, ActionData extends Array<any>>(
  dispatcher: (state: T, ...args: ActionData) => T,
  initialValue: T,
  options?: SignalOptions<T>,
): [accessor: Accessor<T>, dispatch: (...args: ActionData) => void] {
  const [state, setState] = createSignal(initialValue as Exclude<T, Function>, { ownedWrite: true, ...options });

  return [state, (...args: ActionData) => void setState(state => dispatcher(state, ...args))];
}
