import type { Accessor } from "solid-js";

//
// GENERAL HELPERS:
//

export type Fn<R = void> = () => R;
export type Many<T> = T | T[];

export type Keys<O extends Object> = keyof O;
export type Values<O extends Object> = O[Keys<O>];

/**
 * Infers the element type of an array
 */
export type ItemsOf<T> = T extends (infer E)[] ? E : never;
export type MaybeAccessor<T> = T | Accessor<T>;
export type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends Fn ? ReturnType<T> : T;

export const isClient = typeof window !== "undefined";

export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" ? (v as any)() : v;

export const accessAsArray = <T extends MaybeAccessor<any>, V = MaybeAccessorValue<T>>(
  value: T
): V extends any[] ? V : V[] => {
  const _value = access(value);
  return Array.isArray(_value) ? (_value as any) : [_value];
};

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

export const objectOmit = <T extends Object, K extends Array<keyof T>>(
  object: T,
  ...keys: K
): Omit<T, ItemsOf<K>> => {
  const copy = Object.assign({}, object);
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
};

export const createCallbackStack = <Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void>(): {
  push: (...callbacks: Fn[]) => void;
  execute: (arg0: Arg0, arg1: Arg1, arg2: Arg2, arg3: Arg3) => void;
  clear: Fn;
} => {
  let stack: Array<(arg0: Arg0, arg1: Arg1, arg2: Arg2, arg3: Arg3) => void> = [];
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
