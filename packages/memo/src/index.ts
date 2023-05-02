import {
  Accessor,
  createSignal,
  createComputed,
  untrack,
  getOwner,
  onCleanup,
  createMemo,
  runWithOwner,
  Setter,
  on,
  createRoot,
  AccessorArray,
  EffectFunction,
  MemoOptions,
  NoInfer,
  Owner,
  SignalOptions,
  DEV,
} from "solid-js";
import { isServer } from "solid-js/web";
import { debounce, throttle } from "@solid-primitives/scheduled";
import { noop, EffectOptions } from "@solid-primitives/utils";

export type MemoOptionsWithValue<T> = MemoOptions<T> & { value?: T };
export type AsyncMemoCalculation<T, Init = undefined> = (prev: T | Init) => Promise<T> | T;

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
  const disposers = new Set<VoidFunction>();
  let trackers = 0;
  let disposed = false;
  onCleanup(() => {
    for (const fn of disposers) fn();
    disposers.clear();
    disposed = true;
  });

  // track()
  return tracking => {
    if (disposed) {
      untrack(tracking);
      return;
    }
    trackers++;
    createRoot(dispose => {
      disposers.add(dispose);
      let init = true;
      createComputed(() => {
        if (init) {
          init = false;
          return tracking();
        }
        if (--trackers === 0) untrack(onInvalidate);
        dispose();
        disposers.delete(dispose);
      }, options);
    }, owner);
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
  const memos = sources.map((source, i) => createMemo(() => ((index = i), source())));
  return createMemo(() => memos.map(m => m())[index]!, undefined, options);
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
  const mappedSources = sources.map(source => {
    const obj: { dirty: boolean; memo: Accessor<T> } = { dirty: true, memo: null as any };
    obj.memo = createMemo(() => ((obj.dirty = true), source()));
    return obj;
  });
  return createLazyMemo<T[]>(
    () =>
      mappedSources.reduce((acc: T[], data) => {
        // always track all memos to force updates
        const v = data.memo();
        if (data.dirty) {
          data.dirty = false;
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
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
): [signal: Accessor<Next>, setter: Setter<Next>];
export function createWritableMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: MemoOptions<Next>,
): [signal: Accessor<Next>, setter: Setter<Next>];
export function createWritableMemo<T>(
  fn: (prev: T | undefined) => T,
  value?: T,
  options?: MemoOptions<T | undefined>,
): [signal: Accessor<T>, setter: Setter<T>] {
  let combined: Accessor<T> = () => value as T;
  const [signal, setSignal] = createSignal(value as T),
    memo = createMemo(
      callbackWith(fn, () => combined()),
      value,
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
 * @deprecated Please use `createSchedule` from `@solid-primitives/schedule` instead.
 */
export function createDebouncedMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
  timeoutMs: number,
): Accessor<Next>;
export function createDebouncedMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  timeoutMs: number,
  value: Init,
  options?: MemoOptions<Next>,
): Accessor<Next>;
export function createDebouncedMemo<T>(
  fn: (prev: T | undefined) => T,
  timeoutMs: number,
  value?: T,
  options?: MemoOptions<T | undefined>,
): Accessor<T> {
  const memo = createMemo(() => fn(value), undefined, options);
  if (isServer) {
    return memo;
  }
  const [signal, setSignal] = createSignal(untrack(memo));
  const updateSignal = debounce(() => (value = setSignal(memo)), timeoutMs);
  createComputed(on(memo, updateSignal, { defer: true }));
  return signal;
}

/**
 * @deprecated Please use `createSchedule` from `@solid-primitives/schedule` instead.
 */
export function createDebouncedMemoOn<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: (input: S, prevInput: S | undefined, prev: undefined | NoInfer<Prev>) => Next,
  timeoutMs: number,
): Accessor<Next>;
export function createDebouncedMemoOn<S, Next extends Prev, Init = Next, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: (input: S, prevInput: S | undefined, prev: Prev | Init) => Next,
  timeoutMs: number,
  value: Init,
  options?: MemoOptions<Next>,
): Accessor<Next>;
export function createDebouncedMemoOn<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: (input: S, prevInput: S | undefined, prev: Prev | undefined) => Next,
  timeoutMs: number,
  value?: Prev,
  options?: MemoOptions<Next | undefined>,
): Accessor<Next> {
  if (isServer) {
    return createMemo(on(deps, fn as any) as () => any, value);
  }
  let init = true;
  const [signal, setSignal] = createSignal(
    (() => {
      let v!: Next;
      createComputed(
        on(deps, (input, prevInput) => {
          if (init) {
            v = fn(input, prevInput, value);
            init = false;
          } else updateSignal(input, prevInput);
        }),
      );
      return v;
    })(),
    options,
  );
  const updateSignal = debounce((input: S, prevInput: S | undefined) => {
    setSignal(() => fn(input, prevInput, signal()));
  }, timeoutMs);
  return signal;
}

/**
 * @deprecated Please use `createSchedule` from `@solid-primitives/schedule` instead.
 */
export function createThrottledMemo<Next extends Prev, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
  timeoutMs: number,
): Accessor<Next>;
export function createThrottledMemo<Next extends Prev, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  timeoutMs: number,
  value: Init,
  options?: MemoOptions<Next>,
): Accessor<Next>;
export function createThrottledMemo<T>(
  fn: (prev: T | undefined) => T,
  timeoutMs: number,
  value?: T,
  options?: MemoOptions<T | undefined>,
): Accessor<T> {
  if (isServer) {
    return createMemo(fn);
  }
  let onInvalidate: VoidFunction = noop;
  const track = createPureReaction(() => onInvalidate());
  const [state, setState] = createSignal(
    (() => {
      let v!: T;
      track(() => (v = fn(value)));
      return v;
    })(),
    options,
  );
  onInvalidate = throttle(() => track(() => setState(fn)), timeoutMs);
  return state;
}

/**
 * @deprecated Please just use `createResource` instead.
 */
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T, T>,
  options: MemoOptionsWithValue<T> & { value: T },
): Accessor<T>;
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T>,
  options?: MemoOptionsWithValue<T>,
): Accessor<T | undefined>;
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T>,
  options: MemoOptionsWithValue<T | undefined> = {},
): Accessor<T | undefined> {
  if (isServer) {
    return () => options.value;
  }
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

const EQUALS_FALSE = { equals: false } as const;

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

  let isReading = false,
    isStale: boolean | undefined = true;

  const [track, trigger] = createSignal(void 0, EQUALS_FALSE),
    memo = createMemo<T>(
      p => (isReading ? calc(p) : ((isStale = !track()), p)),
      value as T,
      DEV ? { name: options?.name, equals: false } : EQUALS_FALSE,
    );

  return (): T => {
    isReading = true;
    if (isStale) isStale = trigger();
    const v = memo();
    isReading = false;
    return v;
  };
}

/*

createCachedDerivation is a cool idea, but it has a n edgecase where it the value may get out of sync if read in a pure computation after it's sources.
And probably more then that, considering that the calculation is executed where read.

*/

// /**
//  * **! The value may get out of sync if read in a pure computation after it's sources !**
//  * @param deps
//  * @param fn
//  * @param options
//  * @returns
//  */
// export function createCachedDerivation<S, Next extends Prev, Prev = Next>(
//   deps: AccessorArray<S> | Accessor<S>,
//   fn: OnEffectFunction<S, undefined | NoInfer<Prev>, Next>,
//   options?: EffectOptions
// ): Accessor<Next> {
//   let prevInput: S | undefined;
//   let prev: undefined | NoInfer<Prev>;
//   let stale = true;

//   const track = createPureReaction(() => (stale = true), options);

//   const trackDeps = Array.isArray(deps)
//     ? () => {
//         for (const fn of deps) fn();
//       }
//     : deps;

//   const getInput = Array.isArray(deps)
//     ? () => {
//         const res = Array(deps.length);
//         for (let i = 0; i < deps.length; i++) res[i] = deps[i]();
//         return res as S;
//       }
//     : deps;

//   return () => {
//     if (stale) {
//       let input!: S;
//       track(() => (input = getInput()));
//       prev = untrack(() => fn(input, prevInput, prev));
//       prevInput = input;
//       stale = false;
//     }
//     trackDeps();
//     return prev as Next;
//   };
// }

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
    const memo = runWithOwner(owner, () =>
      createLazyMemo<Value>(prev => calc(key, prev), undefined, options),
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
  const [state, setState] = createSignal(initialValue, options);

  return [state, (...args: ActionData) => void setState(state => dispatcher(state, ...args))];
}
