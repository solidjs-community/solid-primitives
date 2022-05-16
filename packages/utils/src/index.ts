import { getOwner, onCleanup, createSignal, Accessor, DEV, untrack, batch } from "solid-js";
import type { BaseOptions, Signal } from "solid-js/types/reactive/signal";
import { isServer } from "solid-js/web";
import type {
  AnyClass,
  MaybeAccessor,
  MaybeAccessorValue,
  Noop,
  Values,
  Trigger,
  TriggerCache,
  AnyObject,
  AnyFunction,
  SetterValue,
  AnyStatic
} from "./types";

export * from "./types";

//
// GENERAL HELPERS:
//

/** no operation */
export const noop = (() => undefined) as Noop;

export const isClient = !isServer;
export { isServer };

/** development environment */
export const isDev = DEV && isClient;
/** production environment */
export const isProd = !isDev;
/** `console.warn` only during development */
export const warn: typeof console.warn = (...a) => isDev && console.warn(...a);

/**
 * Check if the value is an instance of ___
 */
export const ofClass = (v: any, c: AnyClass): boolean =>
  v instanceof c || (v && v.constructor === c);

/** Check if value is typeof "object" or "function" */
export function isObject(value: any): value is AnyObject {
  return value !== null && (typeof value === "object" || typeof value === "function");
}

export const compare = (a: any, b: any): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Returns a function that will call all functions in the order they were chained with the same arguments.
 */
export function chain<Args extends [] | any[]>(callbacks: {
  [Symbol.iterator](): IterableIterator<((...args: Args) => any) | undefined>;
}): (...args: Args) => void {
  return (...args: Args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") callback(...args);
    }
  };
}

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Accesses the value of a MaybeAccessor
 * @example
 * ```ts
 * access("foo") // => "foo"
 * access(() => "foo") // => "foo"
 * ```
 */
export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" && !v.length ? v() : v;

export const asArray = <T>(value: T): T extends any[] ? T : T[] =>
  Array.isArray(value) ? (value as any) : [value];

/**
 * Access an array of MaybeAccessors
 * @example
 * const list = [1, 2, () => 3)] // T: MaybeAccessor<number>[]
 * const newList = accessArray(list) // T: number[]
 */
export const accessArray = <A extends MaybeAccessor<any>>(
  list: readonly A[]
): MaybeAccessorValue<A>[] => list.map(v => access(v));

/**
 * Run the function if the accessed value is not `undefined` nor `null`
 * @param value
 * @param fn
 */
export const withAccess = <T, A extends MaybeAccessor<T>, V = MaybeAccessorValue<A>>(
  value: A,
  fn: (value: NonNullable<V>) => void
) => {
  const _value = access(value);
  typeof _value !== "undefined" && _value !== null && fn(_value as NonNullable<V>);
};

export const asAccessor = <A extends MaybeAccessor<unknown>>(
  v: A
): Accessor<MaybeAccessorValue<A>> => (typeof v === "function" ? (v as any) : () => v);

/** If value is a function – call it with a given arguments – otherwise get the value as is */
export function accessWith<T>(
  valueOrFn: T,
  ...args: T extends AnyFunction ? Parameters<T> : never
): T extends AnyFunction ? ReturnType<T> : T {
  return typeof valueOrFn === "function" ? valueOrFn(...args) : valueOrFn;
}

/**
 * Iterate through object entries.
 */
export function forEachEntry<O extends AnyObject>(
  object: O,
  iterator: (
    key: keyof O,
    item: Values<O>,
    index: number,
    pairs: [keyof O, Values<O>][],
    object: O
  ) => void
): void {
  Object.entries(object).forEach(([key, item], index, pairs) =>
    iterator(key as keyof O, item, index, pairs as [keyof O, Values<O>][], object)
  );
}

/**
 * Get entries of an object
 */
export const entries = Object.entries as <T extends object>(obj: T) => [keyof T, T[keyof T]][];

/**
 * Get keys of an object
 */
export const keys = Object.keys as <T extends object>(object: T) => (keyof T)[];

/**
 * Creates a promise that resolves *(or rejects)* after given time.
 *
 * @param ms timeout duration in ms
 * @param throwOnTimeout promise will be rejected on timeout if set to `true`
 * @param reason rejection reason
 * @returns Promise<void>
 *
 * @example
 * ```ts
 * await promiseTimeout(1500) // will resolve void after timeout
 * await promiseTimeout(1500, true, 'rejection reason') // will reject 'rejection reason' after timout
 * ```
 */
export const promiseTimeout = (
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms)
  );

/**
 * Combination of `Promise.race()` and `promiseTimeout`.
 *
 * @param promises single promise, or array of promises
 * @param ms timeout duration in ms
 * @param throwOnTimeout promise will be rejected on timeout if set to `true`
 * @param reason rejection reason
 * @returns a promise resulting in value of the first source promises to be resolved
 *
 * @example
 * ```ts
 * // single promise
 * await raceTimeout(new Promise(() => {...}), 3000)
 * // list of promises racing
 * await raceTimeout([new Promise(),new Promise()...], 3000)
 * // reject on timeout
 * await raceTimeout(new Promise(), 3000, true, 'rejection reason')
 * ```
 */
export function raceTimeout<T>(
  promises: T,
  ms: number,
  throwOnTimeout: true,
  reason?: string
): T extends any[] ? Promise<Awaited<T[number]>> : Promise<Awaited<T>>;
export function raceTimeout<T>(
  promises: T,
  ms: number,
  throwOnTimeout?: boolean,
  reason?: string
): T extends any[] ? Promise<Awaited<T[number]> | undefined> : Promise<Awaited<T> | undefined>;
export function raceTimeout(
  input: any,
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<any> {
  const promises = asArray(input);
  const race = Promise.race([...promises, promiseTimeout(ms, throwOnTimeout, reason)]);
  race.finally(() => {
    promises.forEach(
      // inputted promises can have .dispose() method on them,
      // it will be called when the first promise resolves, to stop the rest
      (p: any) => p && typeof p === "object" && typeof p.dispose === "function" && p.dispose()
    );
  });
  return race;
}

/**
 * Solid's `onCleanup` that is registered only if there is a root.
 */
export const onRootCleanup: typeof onCleanup = fn => (getOwner() ? onCleanup(fn) : fn);

export const createCallbackStack = <A0 = void, A1 = void, A2 = void, A3 = void>(): {
  push: (...callbacks: ((arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void)[]) => void;
  execute: (arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void;
  clear: VoidFunction;
} => {
  let stack: Array<(arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void> = [];
  const clear: VoidFunction = () => (stack = []);
  return {
    push: (...callbacks) => stack.push(...callbacks),
    execute(arg0, arg1, arg2, arg3) {
      stack.forEach(cb => cb(arg0, arg1, arg2, arg3));
      clear();
    },
    clear
  };
};

/**
 * Group synchronous function calls.
 * @param fn
 * @returns `fn`
 */
export function createMicrotask<A extends any[] | []>(fn: (...a: A) => void): (...a: A) => void {
  let calls = 0;
  let args: A;
  return (...a: A) => {
    (args = a), calls++;
    queueMicrotask(() => --calls === 0 && fn(...args));
  };
}

/** WIP: an easier to setup and type Proxy */
export function createProxy<T extends Record<string | symbol, any>>(traps: {
  get: <K extends keyof T>(key: K) => T[K];
  set: <K extends keyof T>(key: K, value: T[K]) => void;
}): T;
export function createProxy<T extends Record<string | symbol, any>>(traps: {
  get: <K extends keyof T>(key: K) => T[K];
  set?: undefined;
}): Readonly<T>;
export function createProxy(traps: {
  get: (key: string | symbol) => any;
  set?: (key: string | symbol, value: any) => void;
}): any {
  return new Proxy(
    {},
    {
      get: (_, k) => traps.get(k),
      set: (_, k, v) => {
        traps.set?.(k, v);
        return false;
      }
    }
  );
}

/**
 * Set listeners in reactive computations and then trigger them when you want.
 * @returns `[track function, dirty function]`
 * @example
 * const [track, dirty] = createTrigger()
 * createEffect(() => {
 *    track()
 *    ...
 * })
 * // later
 * dirty()
 */
export function createTrigger(options?: BaseOptions): Trigger {
  return createSignal(undefined, { equals: false, name: options?.name });
}

/**
 * Set listeners in reactive computations and then trigger them when you want. Cache trackers by a `key`.
 * @returns `{ track, dirty, dirtyAll }` functions
 * `track` and `dirty` are called with a `key` so that each tracker will trigger an update only when his individual `key` would get marked as dirty.
 * @example
 * const { track, dirty } = createTriggerCache()
 * createEffect(() => {
 *    track(1)
 *    ...
 * })
 * // later
 * dirty(1)
 * // this won't cause an update:
 * dirty(2)
 */
export function createTriggerCache<T>(options?: BaseOptions): TriggerCache<T> {
  const cache = new Map<T, Trigger>();
  return {
    dirty: key => cache.get(key)?.[1](),
    dirtyAll: () => cache.forEach(s => s[1]()),
    track(key) {
      let trigger = cache.get(key);
      if (!trigger) {
        trigger = createTrigger(options);
        cache.set(key, trigger);
      }
      trigger[0]();
    }
  };
}

export type StaticStoreSetter<T extends Readonly<AnyStatic>> = {
  (setter: (prev: T) => Partial<T>): T;
  (state: Partial<T>): T;
  <K extends keyof T>(key: K, state: SetterValue<T[K]>): T;
};

/**
 * A shallowly wrapped reactive store object. It behaves similarly to the creatStore, but with limited features to keep it simple. Designed to be used for reactive objects with static keys, but dynamic values, like reactive Event State, location, etc.
 * @param init initial value of the store
 * @returns
 * ```ts
 * [access: Readonly<T>, write: StaticStoreSetter<T>]
 * ```
 */
export function createStaticStore<T extends Readonly<AnyStatic>>(
  init: T
): [access: T, write: StaticStoreSetter<T>] {
  const copy = { ...init };
  const store = {} as T;
  const cache = new Map<PropertyKey, Signal<any>>();

  const getValue = <K extends keyof T>(key: K): T[K] => {
    const saved = cache.get(key);
    if (saved) return saved[0]();
    const signal = createSignal<any>(copy[key], {
      name: typeof key === "string" ? key : undefined
    });
    cache.set(key, signal);
    delete copy[key];
    return signal[0]();
  };

  const setValue = <K extends keyof T>(key: K, value: SetterValue<any>): void => {
    const saved = cache.get(key);
    if (saved) return saved[1](value);
    if (key in copy) copy[key] = accessWith(value, [copy[key]]);
  };

  for (const key of keys(init)) {
    store[key] = undefined as any;
    Object.defineProperty(store, key, {
      get: getValue.bind(void 0, key)
    });
  }

  const setter = (a: ((prev: T) => Partial<T>) | Partial<T> | keyof T, b?: SetterValue<any>) => {
    if (isObject(a))
      untrack(() => {
        batch(() => {
          for (const [key, value] of entries(accessWith(a, store) as Partial<T>))
            setValue(key as keyof T, () => value);
        });
      });
    else setValue(a, b);
    return store;
  };

  return [store, setter];
}
