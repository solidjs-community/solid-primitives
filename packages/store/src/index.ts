import type { JSX } from "solid-js";
import { batch, untrack } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";

/**
 * Type alias for any function with any number of arguments and any return type.
 */
type AnyFunction = (...args: any[]) => any;

/**
 * type alias for a function that takes another function as an argument and returns a new function
 * @param fn generic function used to infer the types of the arguments and return type
 * @returns a new function with the same arguments as `fn` and returns the same return type
 */
type Action = <A extends AnyFunction>(fn: A) => (...args: Parameters<A>) => ReturnType<A>;

/**
 * type alias for an object with string keys and `Action` function values
 * @returns a generic set of `Action` functions
 */
type Actions = Record<string, Action>;

/**
 * wraps a function with `batch` and `untrack` functions from `solid-js` to improve performance
 * and prevent unnecessary re-renders
 * @param fn the function to wrap
 * @returns the return value of `fn`
 */
export const createAction: Action =
  fn =>
  (...args) =>
    batch(() => untrack(() => fn(...args)));

/**
 * wraps each function in `actions` with `createAction` to improve performance and prevent unnecessary
 * re-renders and returns a new object of the same type
 * @param actions a collection of `Action` functions to wrap
 * @returns a new object of the same type but each function is wrapped with `createAction`
 */
export const createActions = <A extends Actions>(actions: A) => {
  let result: Actions = { ...actions };
  for (const [name, fn] of Object.entries(result)) {
    result[name] = createAction(fn);
  }

  return result as A;
};

/**
 * Solid `Store` enforcing the Flux design pattern which emphasizes a one-way data flow. This typically
 * consists of separate actions that mutate the Store's `state` and `getters` enabling readonly access
 * to the Store's `state`. It is not required for a `FluxStore` to contain both `actions` and `getters`.
 *
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @returns `{ state: T, getters: G, actions: A }`
 */
export type FluxStore<T extends object, G = undefined, A = undefined> = {
  state: T;
  getters: undefined extends G ? undefined : G;
  actions: undefined extends A ? undefined : A;
};

/**
 * Encapsulates a defined `FluxStore` in a function able to create multiple instances of the store.
 * The `initialValueOverride` is optional and can be used to override the initial state of the store.
 *
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @returns `(initialValueOverride?: T | ((fallbackState: T) => T)) => FluxStore<T, G, A>`
 */
export type FluxFactory<T extends object, G = undefined, A = undefined> = (
  initialValueOverride?: T | ((fallbackState: T) => T)
) => FluxStore<T, G, A>;

/**
 * Create a Solid 'Store' by specifying a state type and/or provide an `initialState` and an optional
 * `createMethods` object typically consisting of separate actions that mutate the Store's `state` and
 * `getters` enabling readonly access to the Store's `state`. It is not required for a `FluxStore` to
 * contain both `actions` and `getters`.
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @param initialState object to be wrapped in a Store
 * @param createMethods optional object containing functions to create `actions` and/or `getters`.
 * @returns `FluxStore`
 * @example
 * ```tsx
 * export const counterFluxStore = createFluxStore({
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
 *
 *
 * const {state: counterState, getters: {count}, actions: {increment, reset}} = counterFluxStore;
 * count() // => 5
 * increment()
 * count() // => 6
 * reset() // => 0
 * ```
 */
export function createFluxStore<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  initialState: T,
  createMethods: {
    getters: (state: T) => G;
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): FluxStore<T, G, A>;
export function createFluxStore<T extends object, G extends object | undefined>(
  initialState: T,
  createMethods: {
    getters: (state: T) => G;
  }
): FluxStore<T, G>;
export function createFluxStore<T extends object, A extends object | undefined>(
  initialState: T,
  createMethods: {
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): FluxStore<T, undefined, A>;
export function createFluxStore<T extends object>(
  initialState: T,
  createMethods?: {}
): FluxStore<T>;
export function createFluxStore<
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
  const actions = createActions(createMethods?.actions?.(setState, state) as Actions) as A;

  return {
    state,
    getters,
    actions
  };
}

/**
 * Create a `FluxStore` encapsulated in a `FluxFactory` function.
 * The factory function accepts `initialValueOverride?: T | ((fallbackState: T) => T)` to optionally
 * override the initial state of the store while creating each new instance.
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @param fallbackState fallback object to be wrapped in a Store if no initial value is provided.
 * @param createMethods optional object containing functions to create getters and/or actions.
 * @returns `FluxFactory`
 * @example
 * ```tsx
 * export const counterFluxFactory = createFluxFactory({
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
 *
 * const {state: counterState, getters: {count}, actions: {increment, reset}} = counterFluxFactory({ value: 25 });
 * const {getters: {count: pageViews}, actions: {increment: newPageView, reset: resetPageViews}} = counterFluxFactory({ value: 0 });
 * count() // => 25
 * pageViews() // => 0
 * increment()
 * newPageView()
 * count() // => 26
 * pageViews() // => 1
 * reset() // => 0
 * newPageView()
 * pageViews() // => 2
 * resetPageViews() // => 0
 * ```
 */
export function createFluxFactory<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  fallbackState: T,
  createMethods: {
    getters: (state: T) => G;
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): FluxFactory<T, G, A>;
export function createFluxFactory<T extends object, G extends object | undefined>(
  fallbackState: T,
  createMethods: {
    getters: (state: T) => G;
  }
): FluxFactory<T, G>;
export function createFluxFactory<T extends object, A extends object | undefined>(
  fallbackState: T,
  createMethods: {
    actions: (setState: SetStoreFunction<T>, state: T) => A;
  }
): FluxFactory<T, undefined, A>;
export function createFluxFactory<T extends object>(
  fallbackState: T,
  createMethods?: {}
): FluxFactory<T>;
export function createFluxFactory<
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
  return (initialValueOverride =>
    createFluxStore(
      !!initialValueOverride
        ? typeof initialValueOverride === "function"
          ? untrack(() => initialValueOverride(fallbackState))
          : initialValueOverride
        : fallbackState,
      methods
    )) as FluxFactory<T, G, A>;
}

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
