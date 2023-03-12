import {
  getOwner,
  onCleanup,
  createSignal,
  Accessor,
  DEV,
  untrack,
  batch,
  AccessorArray,
  EffectFunction,
  NoInfer,
  Signal,
  SignalOptions,
  sharedConfig,
  onMount,
} from "solid-js";
import { isServer } from "solid-js/web";
import type {
  AnyClass,
  MaybeAccessor,
  MaybeAccessorValue,
  Noop,
  AnyObject,
  AnyFunction,
  SetterParam,
  AnyStatic,
} from "./types";

export * from "./types";

//
// GENERAL HELPERS:
//

/** no operation */
export const noop = (() => void 0) as Noop;
export const trueFn: () => boolean = () => true;
export const falseFn: () => boolean = () => false;

export { isServer };
export const isClient = !isServer;

/** development environment */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const isDev = DEV && isClient;
/** production environment */
export const isProd = !isDev;

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
    for (const callback of callbacks) callback && callback(...args);
  };
}

/**
 * Returns a function that will call all functions in the reversed order with the same arguments.
 */
export function reverseChain<Args extends [] | any[]>(
  callbacks: (((...args: Args) => any) | undefined)[],
): (...args: Args) => void {
  return (...args: Args) => {
    for (let i = callbacks.length - 1; i >= 0; i--) {
      const callback = callbacks[i];
      callback && callback(...args);
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

export const asArray = <T>(value: T): (T extends any[] ? T[number] : T)[] =>
  Array.isArray(value) ? (value as any) : [value];

/**
 * Access an array of MaybeAccessors
 * @example
 * const list = [1, 2, () => 3)] // T: MaybeAccessor<number>[]
 * const newList = accessArray(list) // T: number[]
 */
export const accessArray = <A extends MaybeAccessor<any>>(
  list: readonly A[],
): MaybeAccessorValue<A>[] => list.map(v => access(v));

/**
 * Run the function if the accessed value is not `undefined` nor `null`
 * @param value
 * @param fn
 */
export const withAccess = <T, A extends MaybeAccessor<T>, V = MaybeAccessorValue<A>>(
  value: A,
  fn: (value: NonNullable<V>) => void,
) => {
  const _value = access(value);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  typeof _value != null && fn(_value as NonNullable<V>);
};

export const asAccessor = <A extends MaybeAccessor<unknown>>(
  v: A,
): Accessor<MaybeAccessorValue<A>> => (typeof v === "function" ? (v as any) : () => v);

/** If value is a function – call it with a given arguments – otherwise get the value as is */
export function accessWith<T>(
  valueOrFn: T,
  ...args: T extends AnyFunction ? Parameters<T> : never
): T extends AnyFunction ? ReturnType<T> : T {
  return typeof valueOrFn === "function" ? valueOrFn(...args) : valueOrFn;
}

/**
 * Solid's `on` helper, but always defers and returns a provided initial value when if does instead of `undefined`.
 *
 * @param deps
 * @param fn
 * @param initialValue
 */
export function defer<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: (input: S, prevInput: S, prev: undefined | NoInfer<Prev>) => Next,
  initialValue: Next,
): EffectFunction<undefined | NoInfer<Next>, NoInfer<Next>>;
export function defer<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: (input: S, prevInput: S, prev: undefined | NoInfer<Prev>) => Next,
  initialValue?: undefined,
): EffectFunction<undefined | NoInfer<Next>>;
export function defer<S, Next extends Prev, Prev = Next>(
  deps: AccessorArray<S> | Accessor<S>,
  fn: (input: S, prevInput: S, prev: undefined | NoInfer<Prev>) => Next,
  initialValue?: Next,
): EffectFunction<undefined | NoInfer<Next>> {
  const isArray = Array.isArray(deps);
  let prevInput: S;
  let shouldDefer = true;
  return prevValue => {
    let input: S;
    if (isArray) {
      input = Array(deps.length) as S;
      for (let i = 0; i < deps.length; i++) (input as any[])[i] = deps[i]();
    } else input = deps();
    if (shouldDefer) {
      shouldDefer = false;
      prevInput = input;
      return initialValue;
    }
    const result = untrack(() => fn(input, prevInput, prevValue));
    prevInput = input;
    return result;
  };
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
export const tryOnCleanup: typeof onCleanup = fn => (getOwner() ? onCleanup(fn) : fn);

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
    clear,
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

/**
 * A hydratable version of the {@link createSignal}. It will use the serverValue on the server and the update function on the client. If initialized during hydration it will use serverValue as the initial value and update it once hydration is complete.
 *
 * @param serverValue initial value of the state on the server
 * @param update called once on the client or on hydration to initialize the value
 * @param options {@link SignalOptions}
 * @returns
 * ```ts
 * [state: Accessor<T>, setState: Setter<T>]
 * ```
 * @see {@link createSignal}
 */
export function createHydratableSignal<T>(
  serverValue: T,
  update: () => T,
  options?: SignalOptions<T>,
): ReturnType<typeof createSignal<T>> {
  if (isServer) {
    return createSignal(serverValue, options);
  }
  if (sharedConfig.context) {
    const [state, setState] = createSignal(serverValue, options);
    onMount(() => setState(() => update()));
    return [state, setState];
  }
  return createSignal(update(), options);
}

/** @deprecated use {@link createHydratableSignal} instead */
export const createHydrateSignal = createHydratableSignal;

export type StaticStoreSetter<T extends Readonly<AnyStatic>> = {
  (setter: (prev: T) => Partial<T>): T;
  (state: Partial<T>): T;
  <K extends keyof T>(key: K, state: SetterParam<T[K]>): T;
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
  init: T,
): [access: T, write: StaticStoreSetter<T>] {
  const copy = { ...init };
  const store = { ...init };
  const cache = new Map<PropertyKey, Signal<any>>();

  const getValue = <K extends keyof T>(key: K): T[K] => {
    const saved = cache.get(key);
    if (saved) return saved[0]();
    const signal = createSignal<any>(copy[key], {
      internal: true,
    });
    cache.set(key, signal);
    delete copy[key];
    return signal[0]();
  };

  const setValue = <K extends keyof T>(key: K, value: SetterParam<any>): void => {
    const saved = cache.get(key);
    if (saved) return saved[1](value);
    if (key in copy) copy[key] = accessWith(value, [copy[key]]);
  };

  for (const key in init) {
    Object.defineProperty(store, key, { get: getValue.bind(void 0, key) });
  }

  const setter = (a: ((prev: T) => Partial<T>) | Partial<T> | keyof T, b?: SetterParam<any>) => {
    if (isObject(a)) {
      const entries = untrack(
        () => Object.entries(accessWith(a, store) as Partial<T>) as [any, any][],
      );
      batch(() => {
        for (const [key, value] of entries) setValue(key, () => value);
      });
    } else setValue(a, b);
    return store;
  };

  return [store, setter];
}

/**
 * A hydratable version of the {@link createStaticStore}. It will use the serverValue on the server and the update function on the client. If initialized during hydration it will use serverValue as the initial value and update it once hydration is complete.
 *
 * @param serverValue initial value of the state on the server
 * @param update called once on the client or on hydration to initialize the value
 * @returns
 * ```ts
 * [access: Readonly<T>, write: StaticStoreSetter<T>]
 * ```
 */
export function createHydratableStaticStore<T extends Readonly<AnyStatic>>(
  serverValue: T,
  update: () => T,
): ReturnType<typeof createStaticStore<T>> {
  if (isServer) return createStaticStore(serverValue);
  if (sharedConfig.context) {
    const [state, setState] = createStaticStore(serverValue);
    onMount(() => setState(update()));
    return [state, setState];
  }
  return createStaticStore(update());
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
  handleRemoved: (item: T) => void,
): void {
  const currLength = current.length;
  const prevLength = prev.length;
  let i = 0;

  if (!prevLength) {
    for (; i < currLength; i++) handleAdded(current[i]!);
    return;
  }

  if (!currLength) {
    for (; i < prevLength; i++) handleRemoved(prev[i]!);
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
