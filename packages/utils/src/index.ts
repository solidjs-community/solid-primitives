import { getOwner, onCleanup, on, Accessor, DEV } from "solid-js";
import type { EffectFunction, NoInfer, OnOptions } from "solid-js/types/reactive/signal";
import type { Store } from "solid-js/store";
import { isServer } from "solid-js/web";
import type {
  AnyClass,
  Destore,
  Fn,
  ItemsOf,
  Keys,
  MaybeAccessor,
  MaybeAccessorValue,
  Noop,
  OnAccessEffectFunction,
  Values
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
export const isDev = DEV && DEV.hasOwnProperty("writeSignal");
/** production environment */
export const isProd = !isDev;
/** `console.warn` only during development */
export const warn: typeof console.warn = (...a) => isDev && console.warn(...a);

/**
 * `if (typeof value !== "undefined" && value !== null)`
 */
export const isDefined = <T>(value: T | undefined | null): value is T =>
  typeof value !== "undefined" && value !== null;
export const isFunction = <T>(value: T | Function): value is Function =>
  typeof value === "function";
export const isBoolean = (val: any): val is boolean => typeof val === "boolean";
export const isNumber = (val: any): val is number => typeof val === "number";
export const isString = (val: unknown): val is string => typeof val === "string";
export const isObject = (val: any): val is object => toString.call(val) === "[object Object]";
export const isArray = (val: any): val is any[] => Array.isArray(val);

export const ofClass = (v: any, c: AnyClass): boolean =>
  v instanceof c || (v && v.constructor === c);

export const compare = (a: any, b: any): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * for creating tuples by inferring type
 * @example
 * const users = tuple(["John", "Jeff", "Joe"]);
 * // users: [string, string, string]
 */
export const tuple = <T extends [] | any[]>(input: T): T => input;

/** `Array.prototype.includes()` without so strict types. Also allows for checking for multiple items */
export const includes = (arr: any[], ...items: any): boolean => {
  for (const item of arr) {
    if (items.includes(item)) return true;
  }
  return false;
};

/**
 * Accesses the value of a MaybeAccessor
 * @example
 * ```ts
 * access("foo") // => "foo"
 * access(() => "foo") // => "foo"
 * ```
 */
export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  isFunction(v) ? (v as any)() : v;

/**
 * Accesses the value of a MaybeAccessor, but always returns an array
 * @example
 * ```ts
 * accessAsArray('abc') // => ['abc']
 * accessAsArray(() => 'abc') // => ['abc']
 * accessAsArray([1,2,3]) // => [1,2,3]
 * accessAsArray(() => [1,2,3]) // => [1,2,3]
 * ```
 */
export const accessAsArray = <T extends MaybeAccessor<any>, V = MaybeAccessorValue<T>>(
  value: T
): V extends any[] ? V : V[] => asArray(access(value)) as any;

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
  isDefined(_value) && fn(_value as NonNullable<V>);
};

export const asAccessor = <A extends MaybeAccessor<unknown>>(
  v: A
): Accessor<MaybeAccessorValue<A>> => (isFunction(v) ? (v as any) : () => v);

export function onAccess<S extends MaybeAccessor<unknown>[] | [], Next, Init = unknown>(
  deps: S,
  fn: OnAccessEffectFunction<S, Init | Next, Next>,
  options?: OnOptions
): EffectFunction<NoInfer<Init> | NoInfer<Next>, NoInfer<Next>> {
  const source = deps.map(asAccessor);
  return (on as any)(source, fn, options);
}

/**
 * Quickly iterate over an MaybeAccessor<any>
 *
 * @example
 * ```ts
 * const myFunc = (source: MaybeAccessor<string[]>) => {
 *    forEach(source, item => console.log(item))
 * }
 * ```
 */
export const forEach = <A extends MaybeAccessor<any>, V = MaybeAccessorValue<A>>(
  array: A,
  iterator: (
    item: V extends any[] ? ItemsOf<V> : V,
    index: number,
    array: V extends any[] ? V : V[]
  ) => void
): void => accessAsArray(array).forEach(iterator as any);

/**
 * Iterate through object entries.
 */
export const forEachEntry = <A extends MaybeAccessor<object>, O = MaybeAccessorValue<A>>(
  object: A,
  iterator: (
    key: keyof O,
    item: Values<O>,
    index: number,
    pairs: [keyof O, Values<O>][],
    object: O
  ) => void
): void => {
  const obj = access(object);
  Object.entries(obj).forEach(([key, item], index, pairs) =>
    iterator(key as keyof O, item, index, pairs as [keyof O, Values<O>][], obj as O)
  );
};

/**
 * Get `Object.entries()` of an MaybeAccessor<object>
 */
export const entries = <A extends MaybeAccessor<object>, O = MaybeAccessorValue<A>>(
  object: A
): [Keys<O>, Values<O>][] => Object.entries(access(object)) as [Keys<O>, Values<O>][];

/**
 * Get `Object.keys()` of an MaybeAccessor<Object>
 */
export const keys = <A extends MaybeAccessor<object>>(object: A) =>
  Object.keys(access(object)) as (keyof MaybeAccessorValue<A>)[];

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

/**
 * Allows the Solid's store to be destructured
 *
 * @param store
 * @returns Destructible object, with values changed to accessors
 *
 * @example
 * ```ts
 * const [state, setState] = createStore({
 *   count: 0,
 *   get double() { return this.count * 2 },
 * })
 * const { count, double } = destore(state)
 * // use it like a signal:
 * count()
 * ```
 */
export function destore<T extends Object>(store: Store<T>): Destore<T> {
  const _store = store as Record<string, any>;
  const result: any = {};
  Object.keys(_store).forEach(key => {
    result[key] = isFunction(_store[key]) ? _store[key].bind(_store) : () => _store[key];
  });
  return result;
}

export const createCallbackStack = <A0 = void, A1 = void, A2 = void, A3 = void>(): {
  push: (...callbacks: ((arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void)[]) => void;
  execute: (arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void;
  clear: Fn;
} => {
  let stack: Array<(arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void> = [];
  const clear: Fn = () => (stack = []);
  return {
    push: (...callbacks) => stack.push(...callbacks),
    execute(arg0, arg1, arg2, arg3) {
      stack.forEach(cb => cb(arg0, arg1, arg2, arg3));
      clear();
    },
    clear
  };
};

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
