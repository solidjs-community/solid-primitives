import { accessWith, isObject, type SetterParam } from "@solid-primitives/utils";
import {
  type Accessor,
  batch,
  createMemo,
  createSignal,
  type EffectFunction,
  getListener,
  getOwner,
  type MemoOptions,
  type NoInfer,
  onMount,
  runWithOwner,
  sharedConfig,
  type Signal,
  untrack,
} from "solid-js";
import { isServer } from "solid-js/web";

export type StaticStoreSetter<T extends object> = {
  (setter: (prev: T) => Partial<T>): T;
  (state: Partial<T>): T;
  <K extends keyof T>(key: K, state: SetterParam<T[K]>): T;
};

/**
 * A shallowly wrapped reactive store object. It behaves similarly to the createStore, but with limited features to keep it simple. Designed to be used for reactive objects with static keys, but dynamic values, like reactive Event State, location, etc.
 * @param init initial value of the store
 * @returns tuple with the store object and a setter function
 * ```ts
 * [access: T, write: StaticStoreSetter<T>]
 * ```
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/static-store#createStaticStore
 * @example
 * ```ts
 * const [size, setSize] = createStaticStore({ width: 0, height: 0 });
 *
 * el.addEventListener("resize", () => {
 *  setSize({ width: el.offsetWidth, height: el.offsetHeight });
 * });
 *
 * createEffect(() => {
 *   console.log(size.width, size.height);
 * })
 * ```
 */
export function createStaticStore<T extends object>(
  init: T,
): [access: T, write: StaticStoreSetter<T>] {
  const copy = { ...init },
    store = { ...init },
    cache: Partial<Record<PropertyKey, Signal<T[keyof T]>>> = {};

  const getValue = (key: keyof T): T[keyof T] => {
    let signal = cache[key];
    if (!signal) {
      if (!getListener()) return copy[key];
      cache[key] = signal = createSignal(copy[key], { internal: true });
      delete copy[key];
    }
    return signal[0]();
  };

  for (const key in init) {
    Object.defineProperty(store, key, { get: () => getValue(key), enumerable: true });
  }

  const setValue = (key: keyof T, value: SetterParam<any>): void => {
    const signal = cache[key];
    if (signal) return signal[1](value);
    if (key in copy) copy[key] = accessWith(value, copy[key]);
  };

  return [
    store,
    (a: ((prev: T) => Partial<T>) | Partial<T> | keyof T, b?: SetterParam<any>) => {
      if (isObject(a)) {
        const entries = untrack(
          () => Object.entries(accessWith(a, store) as Partial<T>) as [any, any][],
        );
        batch(() => {
          for (const [key, value] of entries) setValue(key, () => value);
        });
      } else setValue(a, b);
      return store;
    },
  ];
}

/**
 * A hydratable version of the {@link createStaticStore}. It will use the {@link serverValue} on the server and the {@link update} function on the client. If initialized during hydration it will use {@link serverValue} as the initial value and update it once hydration is complete.
 *
 * @param serverValue initial value of the state on the server
 * @param update called once on the client or on hydration to initialize the value
 * @returns tuple with the store object and a setter function
 * ```ts
 * [access: T, write: StaticStoreSetter<T>]
 * ```
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/static-store#createHydratableStaticStore
 */
export function createHydratableStaticStore<T extends object>(
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
 * A derived version of the {@link createStaticStore}. It will use the update function to derive the value of the store. It will only update when the dependencies of the update function change.
 * @param fn a reactive function to derive the value of the store
 * @returns a shallow, reactive, static store object
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/static-store#createDerivedStaticStore
 * @example
 * ```ts
 * const [size, setSize] = createSignal({ width: 0, height: 0 });
 *
 * el.addEventListener("resize", () => {
 *  setSize({ width: el.offsetWidth, height: el.offsetHeight });
 * });
 *
 * const store = createDerivedStaticStore(size);
 *
 * createEffect(() => {
 *   console.log(store.width, store.height);
 * })
 * ```
 */
export function createDerivedStaticStore<Next extends Prev & object, Prev = Next>(
  fn: EffectFunction<undefined | NoInfer<Prev>, Next>,
): Next;
export function createDerivedStaticStore<Next extends Prev & object, Init = Next, Prev = Next>(
  fn: EffectFunction<Init | Prev, Next>,
  value: Init,
  options?: MemoOptions<Next>,
): Next;
export function createDerivedStaticStore<T extends object>(
  fn: EffectFunction<T | undefined, T>,
  value?: T,
  options?: MemoOptions<T>,
): T {
  const o = getOwner(),
    fnMemo = createMemo(fn, value, options),
    store = { ...untrack(fnMemo) },
    cache: Partial<Record<keyof T, Accessor<T[keyof T]>>> = {};

  for (const key in store)
    Object.defineProperty(store, key, {
      get() {
        let keyMemo = cache[key];
        if (!keyMemo) {
          if (!getListener()) return fnMemo()[key];
          runWithOwner(o, () => (cache[key] = keyMemo = createMemo(() => fnMemo()[key])));
        }
        return keyMemo!();
      },
      enumerable: true,
    });

  return store;
}
