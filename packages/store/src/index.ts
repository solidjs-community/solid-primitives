import type { JSX } from "solid-js";
import { batch, untrack } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";

type AnyFunction = (...args: any[]) => any;
type Action<A extends AnyFunction> = (...args: Parameters<A>) => ReturnType<A>;
type CreateAction = <A extends AnyFunction>(fn: A) => Action<A>;
type CreateActions = <A extends object | undefined>(fns?: A) => A | undefined;

export const createAction: CreateAction =
  fn =>
  (...args) =>
    batch(() => untrack(() => fn(...args)));
export const createActions: CreateActions = actions => {
  if (!actions) return undefined;

  let result = { ...actions };
  // for (const [name, fn] of Object.entries(result) as [keyof typeof result, AnyFunction][]) {
  for (const [name, fn] of Object.entries(result)) {
    if (typeof fn !== "function") continue;
    result = {
      ...result,
      [name]: createAction(fn)
    };
  }

  return result;
};

/**
 * Create a shared store.
 *
 * @typedef SharedStore
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @returns {
 *  {T} state - The current state of the store.
 *  {G} getters - Predefined methods to access the state of the store.
 *  {A} actions - Predefined methods to mutate the state of the store.
 *  {SetStoreFunction<T>} setState - A function to manually mutate the current state of the store.
 * }
 */
export type SharedStore<T extends object, G = undefined, A = undefined> = {
  state: T;
  getters: undefined extends G ? undefined : G;
  actions: undefined extends A ? undefined : A;
  setState: SetStoreFunction<T>;
};

/**
 * Factory to create reusable stores.
 *
 * @typedef StoreFactory
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @returns (initialValueSetter?: T | ((fallbackState: T) => T)) => SharedStore<T, G, A>
 */
export type StoreFactory<T extends object, G = undefined, A = undefined> = (
  initialValueSetter?: T | ((fallbackState: T) => T)
) => SharedStore<T, G, A>;

/**
 * createSharedStore takes an `initialState` and an optional object containing functions to create getters and/or actions.
 * A store is created and returned along with access and mutation functions & the native `setState`.
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @param initialState object to be wrapped in a Store
 * @param createMethods optional object containing functions to create getters and/or actions.
 * @returns `SharedStore`
 * @example
 * ```tsx
 * // `counter-store.ts`
 * export const counterStore = createSharedStore({
 *   value: 5,
 * }, {
 *  getters: state => ({
 *   count: () => state.value,
 *  }),
 *  actions: (setState, state) => ({
 *   increment: () => setState(val => ({ ...val, value: val.value + 1 })),
 *   reset: () => setState("value", 0),
 *  })
 * });
 *
 * // `Example.tsx`
 * import { counterStore } from './counter-store.ts';
 *
 * const {state: counterState, getters: {count}, actions: {increment, reset}} = counterStore;
 * count() // => 5
 * increment()
 * count() // => 6
 * reset() // => 0
 * ```
 */
export function createSharedStore<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  initialState: T,
  createMethods: {
    getters: (state: T) => G;
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): SharedStore<T, G, A>;
export function createSharedStore<T extends object, G extends object | undefined>(
  initialState: T,
  createMethods: {
    getters: (state: T) => G;
  }
): SharedStore<T, G>;
export function createSharedStore<T extends object, A extends object | undefined>(
  initialState: T,
  createMethods: {
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): SharedStore<T, undefined, A>;
export function createSharedStore<T extends object>(
  initialState: T,
  createMethods?: {}
): SharedStore<T>;
export function createSharedStore<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  initialState: T,
  createMethods?: {
    getters?: (state: T) => G;
    actions?: (setState: SetStoreFunction<T>, state: T) => A;
  }
) {
  const [state, setState] = createStore<T>(initialState);
  const getters = createMethods?.getters?.(state);
  const actions = createActions(createMethods?.actions?.(setState, state));

  return {
    state,
    getters,
    actions,
    setState
  };
}

/**
 * createStoreFactory takes an `fallbackState` and an optional object containing functions to create getters and/or actions.
 * A store factory is created  and returns a function enabling rapid shared store creation. along with access and mutation
 * functions & the native `setState`.
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @param fallbackState fallback object to be wrapped in a Store if no initial value is provided.
 * @param createMethods optional object containing functions to create getters and/or actions.
 * @returns `StoreFactory`
 * @example
 * ```tsx
 * // `counter-store.ts`
 * export const counterStoreFactory = createStoreFactory({
 *   value: 5,
 * }, {
 *  getters: state => ({
 *   count: () => state.value,
 *  }),
 *  actions: (setState, state) => ({
 *   increment: () => setState(val => ({ ...val, value: val.value + 1 })),
 *   reset: () => setState("value", 0),
 *  })
 * });
 *
 * // `Example.tsx`
 * import { counterStoreFactory } from './counter-store.ts';
 *
 * const {state: counterState, getters: {count}, actions: {increment, reset}} = counterStoreFactory({ value: 25 });
 * count() // => 25
 * increment()
 * count() // => 26
 * reset() // => 0
 * ```
 */
export function createStoreFactory<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  fallbackState: T,
  createMethods: {
    getters: (state: T) => G;
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): StoreFactory<T, G, A>;
export function createStoreFactory<T extends object, G extends object | undefined>(
  fallbackState: T,
  createMethods: {
    getters: (state: T) => G;
  }
): StoreFactory<T, G>;
export function createStoreFactory<T extends object, A extends object | undefined>(
  fallbackState: T,
  createMethods: {
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): StoreFactory<T, undefined, A>;
export function createStoreFactory<T extends object>(
  fallbackState: T,
  createMethods?: {}
): StoreFactory<T>;
export function createStoreFactory<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  fallbackState: T,
  createMethods?: {
    getters?: (state: T) => G;
    actions?: (setState: SetStoreFunction<T>, state: T) => A;
  }
) {
  const methods = {
    getters: createMethods?.getters as (state: T) => G,
    actions: createMethods?.actions as (setState: SetStoreFunction<T>, state: T) => A
  };
  return (initialValueSetter =>
    createSharedStore(
      !!initialValueSetter
        ? typeof initialValueSetter === "function"
          ? untrack(() => initialValueSetter(fallbackState))
          : initialValueSetter
        : fallbackState,
      methods
    )) as StoreFactory<T, G, A>;
}

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
