import type { Store } from "solid-js/store";
import { isServer } from "solid-js/web";
import type { Destore, Fn, ItemsOf, MaybeAccessor, MaybeAccessorValue, Values } from "./types";

export * from "./types";

//
// GENERAL HELPERS:
//

export const isClient = !isServer;
export { isServer };

/**
 * Accesses the value of a MaybeAccessor
 * @example
 * access(x as MaybeAccessor<string>)
 * // => string
 * access(x as MaybeAccessor<() => string>)
 * // => string | (() => string)
 * access(x as MaybeAccessor<string> | Function)
 * // => string | void
 */
export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" ? (v as any)() : v;

/**
 * Accesses the value of a MaybeAccessor, but always returns an array
 * @example
 * accessAsArray('abc') // => ['abc']
 * accessAsArray(() => 'abc') // => ['abc']
 * accessAsArray([1,2,3]) // => [1,2,3]
 * accessAsArray(() => [1,2,3]) // => [1,2,3]
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
  if (typeof _value !== "undefined" && _value !== null) fn(_value as NonNullable<V>);
};

export const forEach = <A extends MaybeAccessor<any>, V = MaybeAccessorValue<A>>(
  array: A,
  iterator: (
    item: V extends any[] ? ItemsOf<V> : V,
    index: number,
    array: V extends any[] ? V : V[]
  ) => void
): void => accessAsArray(array).forEach(iterator as any);

export const entries = <A extends MaybeAccessor<Object>, V = MaybeAccessorValue<A>>(
  object: A
): [string, Values<V>][] => Object.entries(access(object));

export const promiseTimeout = (
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms)
  );

/**
 * Create a new subset object without provided keys
 */
export const objectOmit = <O extends Object, K extends keyof O>(
  object: O,
  ...keys: K[]
): Omit<O, K> => {
  const copy = Object.assign({}, object);
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
};

/**
 * Create a new subset object with provided keys
 */
export const objectPick = <O extends Object, K extends keyof O>(
  object: O,
  ...keys: K[]
): Pick<O, K> =>
  keys.reduce((n, k) => {
    if (k in object) n[k] = object[k];
    return n;
  }, {} as Pick<O, K>);

/**
 * Allows the Solid's store to be destructured
 *
 * @param store
 * @returns Destructible object, with values changed to accessors
 *
 * @example
 * const [state, setState] = createStore({
 *   count: 0,
 *   get double() { return this.count * 2 },
 * })
 * const { count, double } = destore(state)
 * // use it like a signal:
 * count()
 */
export function destore<T extends Object>(store: Store<T>): Destore<T> {
  const _store = store as Record<string, any>;
  const result: any = {};
  Object.keys(_store).forEach(key => {
    result[key] = typeof _store[key] === "function" ? _store[key].bind(_store) : () => _store[key];
  });
  return result;
}

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

export const stringConcat = (...a: MaybeAccessor<any>[]): string =>
  a.reduce((t: string, c) => t + access(c), "") as string;

export const concat = <A extends MaybeAccessor<any>[], V = MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Array<V extends any[] ? ItemsOf<V> : V> =>
  a.reduce((t, c) => {
    const v = access(c);
    return Array.isArray(v) ? [...t, ...v] : [...t, v];
  }, []);

export const toFloat = (string: MaybeAccessor<string>): number => Number.parseFloat(access(string));

export const toInt = (string: MaybeAccessor<string>, radix?: number): number =>
  Number.parseInt(access(string), radix);

export const toArray = <A extends MaybeAccessor<any>[]>(
  ...a: A
): MaybeAccessorValue<ItemsOf<A>>[] => a.map(v => access(v));
