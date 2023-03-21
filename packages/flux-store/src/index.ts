import { batch, untrack } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";

/**
 * Type alias for any function with any number of arguments and any return type.
 */
export type AnyFunction = (...args: any[]) => any;
export type AnyFunctionsRecord = { readonly [K in string]: AnyFunction };

/**
 * type alias for an object with string keys and `Action` function values
 * @returns a generic set of `Action` functions
 */
export type Actions<T extends AnyFunctionsRecord> = { readonly [K in keyof T]: T[K] };

/**
 * Identify function creating an action - function for mutating the state.
 * Actions are `batch`ed and `untrack`ed by default - no need to wrap them in `batch` and `untrack`.
 * @param fn the function to wrap
 * @returns function of the same signature as `fn` but wrapped in `batch` and `untrack`
 */
export function createAction<T extends AnyFunction>(fn: T): T {
  return ((...args) => batch(() => untrack(() => fn(...args)))) as T;
}

/**
 * wraps each function in `actions` with `createAction` to improve performance and prevent unnecessary
 * re-renders and returns a new object of the same type
 * @param actions a collection of `Action` functions to wrap
 * @returns a new object of the same type but each function is wrapped with `createAction`
 */
export function createActions<T extends AnyFunctionsRecord>(functions: T): Actions<T> {
  const actions: Record<string, AnyFunction> = { ...functions };
  for (const [name, fn] of Object.entries(functions)) {
    actions[name] = createAction(fn);
  }
  return actions as any;
}

/**
 * Solid `Store` enforcing the Flux design pattern which emphasizes a one-way data flow. This typically
 * consists of separate actions that mutate the Store's `state` and `getters` enabling readonly access
 * to the Store's `state`. It is not required for a `FluxStore` to contain both `actions` and `getters`.
 *
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @returns `{ state: T, getters: G, actions: A }`
 */
export type FluxStore<
  TState extends object,
  TActions extends AnyFunctionsRecord,
  TGetters extends AnyFunctionsRecord = {},
> = {
  state: TState;
  getters: TGetters;
  actions: Actions<TActions>;
};

/**
 * Encapsulates a defined `FluxStore` in a function able to create multiple instances of the store.
 * The `initialValueOverride` is optional and can be used to override the initial state of the store.
 *
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @returns `(initialValueOverride?: T | ((fallbackState: T) => T)) => FluxStore<T, G, A>`
 */
export type FluxFactory<
  TState extends object,
  TActions extends AnyFunctionsRecord,
  TGetters extends AnyFunctionsRecord = {},
> = (
  initialValueOverride?: TState | ((fallbackState: TState) => TState),
) => FluxStore<TState, TActions, TGetters>;

/**
 * Create a Solid 'Store' by specifying a state type and/or provide an `initialState` and
 * `createMethods` object typically consisting of separate actions that mutate the Store's `state` and
 * `getters` enabling readonly access to the Store's `state`.
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @param initialState object to be wrapped in a Store
 * @param createMethods object containing functions to create `actions` and/or `getters`.
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
  TState extends object,
  TActions extends AnyFunctionsRecord,
  TGetters extends AnyFunctionsRecord,
>(
  initialState: TState,
  createMethods: {
    getters: (state: TState) => TGetters;
    actions: (setState: SetStoreFunction<TState>, state: TState) => TActions;
  },
): FluxStore<TState, TActions, TGetters>;
export function createFluxStore<TState extends object, TActions extends AnyFunctionsRecord>(
  initialState: TState,
  createMethods: {
    actions: (setState: SetStoreFunction<TState>, state: TState) => TActions;
  },
): FluxStore<TState, TActions>;
export function createFluxStore<
  TState extends object,
  TActions extends AnyFunctionsRecord,
  TGetters extends AnyFunctionsRecord,
>(
  initialState: TState,
  createMethods: {
    getters?: (state: TState) => TGetters;
    actions: (setState: SetStoreFunction<TState>, state: TState) => TActions;
  },
): FluxStore<TState, TActions, TGetters | {}> {
  const [state, setState] = createStore(initialState);
  return {
    state,
    getters: createMethods.getters ? createMethods.getters(state) : {},
    actions: createActions(createMethods.actions(setState, state)),
  };
}

/**
 * Create a `FluxStore` encapsulated in a `FluxFactory` function.
 * The factory function accepts `initialValueOverride?: T | ((fallbackState: T) => T)` to optionally
 * override the initial state of the store while creating each new instance.
 * @template `<T: state type of the store, G: store access methods | undefined, A: store mutation methods | undefined>`
 * @param fallbackState fallback object to be wrapped in a Store if no initial value is provided.
 * @param createMethods object containing functions to create getters and/or actions.
 * @returns `FluxFactory`
 * @example
 * ```tsx
 * export const counterFluxFactory = createFluxStoreFactory({
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
export function createFluxStoreFactory<
  TState extends object,
  TActions extends AnyFunctionsRecord,
  TGetters extends AnyFunctionsRecord,
>(
  fallbackState: TState,
  createMethods: {
    getters: (state: TState) => TGetters;
    actions: (setState: SetStoreFunction<TState>, state: TState) => TActions;
  },
): FluxFactory<TState, TActions, TGetters>;
export function createFluxStoreFactory<TState extends object, TActions extends AnyFunctionsRecord>(
  fallbackState: TState,
  createMethods: {
    actions: (setState: SetStoreFunction<TState>, state: TState) => TActions;
  },
): FluxFactory<TState, TActions>;
export function createFluxStoreFactory<
  TState extends object,
  TActions extends AnyFunctionsRecord,
  TGetters extends AnyFunctionsRecord,
>(
  fallbackState: TState,
  createMethods: {
    getters?: (state: TState) => TGetters;
    actions: (setState: SetStoreFunction<TState>, state: TState) => TActions;
  },
): FluxFactory<TState, TActions, TGetters | {}> {
  return initialValueOverride =>
    createFluxStore(
      !!initialValueOverride
        ? typeof initialValueOverride === "function"
          ? untrack(() => initialValueOverride({ ...fallbackState }))
          : { ...initialValueOverride }
        : { ...fallbackState },
      createMethods,
    );
}
