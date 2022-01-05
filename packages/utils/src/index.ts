import { getOwner, onCleanup } from "solid-js";
import type { Store } from "solid-js/store";
import { isServer } from "solid-js/web";
import type { Destore, Fn, ItemsOf, MaybeAccessor, MaybeAccessorValue, Values } from "./types";

export * from "./types";

//
// GENERAL HELPERS:
//

/** no operation */
export const noop = (...a: any[]) => {};
export const isClient = !isServer;
export { isServer };

/**
 * `if (typeof value !== "undefined" && value !== null)`
 */
export const isDefined = <T>(value: T | undefined | null): value is T =>
  typeof value !== "undefined" && value !== null;

/**
 * Accesses the value of a MaybeAccessor
 * @example
 * ```ts
 * access("foo") // => "foo"
 * access(() => "foo") // => "foo"
 * ```
 */
export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" ? (v as any)() : v;

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
): V extends any[] ? V : V[] => {
  const _value = access(value);
  return Array.isArray(_value) ? (_value as any) : [_value];
};

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
 * Get `Object.entries()` of an MaybeAccessor<Object>
 */
export const entries = <A extends MaybeAccessor<Object>, V = MaybeAccessorValue<A>>(
  object: A
): [string, Values<V>][] => Object.entries(access(object));

/**
 * Creates a promise that resolves *(or rejects)* after gives time.
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
  promises: any,
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<any> {
  const promiseList = Array.isArray(promises) ? promises : [promises];
  promiseList.push(promiseTimeout(ms, throwOnTimeout, reason));
  return Promise.race(promiseList);
}

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
    result[key] = typeof _store[key] === "function" ? _store[key].bind(_store) : () => _store[key];
  });
  return result;
}

/**
 * Solid's `onCleanup` that runs only if there is a root.
 */
export const onRootCleanup: typeof onCleanup = fn => (getOwner() ? onCleanup(fn) : fn);

// createSubRoot requires solid 1.3.0:

// /**
//  * Creates a reactive root, which will be disposed when the passed owner does.
//  *
//  * @param fn
//  * @param owner a root that will trigger the cleanup
//  * @returns whatever the "fn" returns
//  *
//  * @example
//  * const owner = getOwner()
//  * const handleClick = () => createSubRoot(owner, () => {
//  *    createEffect(() => {})
//  * });
//  */
// export function createSubRoot<T>(owner: Owner | null, fn: (dispose: Fn) => T): T {
//   const [dispose, returns] = createRoot(dispose => [dispose, fn(dispose)], owner ?? undefined);
//   owner && runWithOwner(owner, () => onCleanup(dispose));
//   return returns;
// }

// /**
//  * A wrapper for creating functions with the `createSubRoot`
//  *
//  * @param callback
//  * @param owner a root that will trigger the cleanup
//  * @returns the callback function
//  *
//  * @example
//  * const handleClick = createSubRootFunction(() => {
//  *    createEffect(() => {})
//  * })
//  */
// export function createSubRootFunction<T extends AnyFunction>(callback: T, owner = getOwner()): T {
//   return ((...args) => createSubRoot(owner, () => callback(...args))) as T;
// }

export const createCallbackStack = <A0 = void, A1 = void, A2 = void, A3 = void>(): {
  push: (...callbacks: Fn[]) => void;
  execute: (arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void;
  clear: Fn;
} => {
  let stack: Array<(arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void> = [];
  const clear: Fn = () => (stack = []);
  return {
    push: (...callbacks) => stack.push(...callbacks),
    execute: (arg0, arg1, arg2, arg3) => {
      stack.forEach(cb => cb(arg0, arg1, arg2, arg3));
      clear();
    },
    clear
  };
};

//
// SIGNAL BUILDERS:
//

// export const stringConcat = (...a: MaybeAccessor<any>[]): string =>
//   a.reduce((t: string, c) => t + access(c), "") as string;

// export const concat = <A extends MaybeAccessor<any>[], V = MaybeAccessorValue<ItemsOf<A>>>(
//   ...a: A
// ): Array<V extends any[] ? ItemsOf<V> : V> =>
//   a.reduce((t, c) => {
//     const v = access(c);
//     return Array.isArray(v) ? [...t, ...v] : [...t, v];
//   }, []);

// export const toFloat = (string: MaybeAccessor<string>): number => Number.parseFloat(access(string));

// export const toInt = (string: MaybeAccessor<string>, radix?: number): number =>
//   Number.parseInt(access(string), radix);

// export const toArray = <A extends MaybeAccessor<any>[]>(
//   ...a: A
// ): MaybeAccessorValue<ItemsOf<A>>[] => a.map(v => access(v));
