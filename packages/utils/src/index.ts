import {
  getOwner,
  onCleanup,
  createSignal,
  Accessor,
  DEV,
  untrack,
  batch,
  getListener
} from "solid-js";
import type { Signal } from "solid-js/types/reactive/signal";
import { isServer as _isServer } from "solid-js/web";
import type {
  AnyClass,
  MaybeAccessor,
  MaybeAccessorValue,
  Noop,
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

export const isServer: boolean = _isServer;
export const isClient = !isServer;

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
 * Check shallow array equality
 */
export const arrayEquals = (a: readonly unknown[], b: readonly unknown[]): boolean =>
  a === b || (a.length === b.length && a.every((e, i) => e === b[i]));

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
 * Get entries of an object
 */
export const entries = Object.entries as <T extends object>(obj: T) => [keyof T, T[keyof T]][];

/**
 * Get keys of an object
 */
export const keys = Object.keys as <T extends object>(object: T) => (keyof T)[];

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

export type Trigger = [track: VoidFunction, dirty: VoidFunction];

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
export const createTrigger: () => Trigger = isDev
  ? () => createSignal(undefined, { equals: false, name: "trigger" })
  : () => createSignal(undefined, { equals: false });

function dirtyTriggerCache<T>(
  this: T extends object ? WeakMap<T, Trigger> | Map<T, Trigger> : Map<T, Trigger>,
  key: T
): void {
  const trigger = this.get(key);
  if (trigger) trigger[1]();
}

function dirtyAllTriggerCache(this: Map<any, Trigger>): void {
  this.forEach(s => s[1]());
}

function trackTriggerCache<T>(
  this: T extends object ? WeakMap<T, Trigger> | Map<T, Trigger> : Map<T, Trigger>,
  key: T
): void {
  if (!getListener()) return;
  let trigger = this.get(key);
  if (!trigger) {
    trigger = createTrigger();
    this.set(key, trigger);
  }
  trigger[0]();
}

export type TriggerCache<T> = {
  track: (v: T) => void;
  dirty: (v: T) => void;
  dirtyAll: VoidFunction;
};

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
export function createTriggerCache<T>(): TriggerCache<T> {
  const cache = new Map<T, Trigger>();
  return {
    dirty: dirtyTriggerCache.bind(cache),
    dirtyAll: dirtyAllTriggerCache.bind(cache),
    track: trackTriggerCache.bind(cache)
  };
}

export type WeakTriggerCache<T extends object> = {
  track: (v: T) => void;
  dirty: (v: T) => void;
};

/**
 * Set listeners in reactive computations and then trigger them when you want. Cache trackers by a `key`.
 * @returns `{ track, dirty }` functions
 * `track` and `dirty` are called with a `key` so that each tracker will trigger an update only when his individual `key` would get marked as dirty.
 * @example
 * const { track, dirty } = createWeakTriggerCache()
 * createEffect(() => {
 *    track(1)
 *    ...
 * })
 * // later
 * dirty(1)
 * // this won't cause an update:
 * dirty(2)
 */
export function createWeakTriggerCache<T extends object>(): WeakTriggerCache<T> {
  const cache = new WeakMap<T, Trigger>();
  return {
    dirty: dirtyTriggerCache.bind(cache as any),
    track: trackTriggerCache.bind(cache as any)
  };
}

export type StaticStoreSetter<T extends Readonly<AnyStatic>> = {
  (setter: (prev: T) => Partial<T>): T;
  (state: Partial<T>): T;
  <K extends keyof T>(key: K, state: SetterValue<T[K]>): T;
};

/**
 * A shallowly wrapped reactive store object. It behaves similarly to the createStore, but with limited features to keep it simple. Designed to be used for reactive objects with static keys, but dynamic values, like reactive Event State, location, etc.
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

/**
 * Handle items removed and added to the array by diffing it by refference.
 *
 * @param current new array instance
 * @param prev previous array copy
 * @param handleAdded called once for every added item to array
 * @param handleRemoved called once for every removed from array
 */
export function handleDiffArray<T>(
  current: readonly T[],
  prev: readonly T[],
  handleAdded: (item: T) => void,
  handleRemoved: (item: T) => void
): void {
  const currLength = current.length;
  const prevLength = prev.length;
  let i = 0;

  if (!prevLength) {
    for (; i < currLength; i++) handleAdded(current[i]);
    return;
  }

  if (!currLength) {
    for (; i < prevLength; i++) handleRemoved(prev[i]);
    return;
  }

  for (; i < prevLength; i++) {
    if (prev[i] !== current[i]) break;
  }

  let prevEl: T;
  let currEl: T;
  prev = prev.slice(i);
  current = current.slice(i);

  for (prevEl of prev) {
    if (!current.includes(prevEl)) handleRemoved(prevEl);
  }
  for (currEl of current) {
    if (!prev.includes(currEl)) handleAdded(currEl);
  }
}

export const forEachEntry = <T>(obj: Record<string, T>, fn: (key: string, value: T) => void): void =>
  Object.entries(obj).forEach(([key, value])=> fn(key, value));
