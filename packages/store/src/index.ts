import type { JSX, FlowComponent } from "solid-js";
import { createContext, useContext } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";

/**
 * An object containing functions to create getters and/or actions.
 *
 * @interface SharedStoreMethods
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @property {(state: State<T>) => G} getters - A function that returns an object containing functions to access the state.
 * @property {(setState: SetStoreFunction<T>) => A} actions - A function that returns an object containing functions that mutate the state.
 */
export interface SharedStoreMethods<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
> {
  getters?: (state: T) => G;
  actions?: (setState: SetStoreFunction<T>) => A;
}

/**
 * An interface representing the returned shared state functionality.
 * It consists of the state, any predefined methods to access and mutate the state and the setState function.
 *
 * @interface SharedStore
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @property {() => [state: T, methods: { getters: G; actions: A; }]} useStore - A function to retrieve the current state and access/mutation functions.
 * @property {SetStoreFunction<T>} setState - A function to manually mutate the current state of the store.
 */
export interface SharedStore<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
> {
  useStore: () => [
    state: T,
    methods: {
      getters: G;
      actions: A;
    }
  ];
  setState: SetStoreFunction<T>;
}

/**
 * A tuple for a Shared Store
 *
 * @typedef SharedStoreReturn
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @property {FlowComponent<Partial<T>>} SharedStoreProvider - A Flow component that provides partial state to the store
 * @property {SharedStore<T, G, A>} SharedStore - The state, any predefined methods to access and mutate the state and the setState function.
 */
export type SharedStoreReturn<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
> = [SharedStoreProvider: FlowComponent<Partial<T>>, SharedStore: SharedStore<T, G, A>];

/**
 * createSharedStore takes an `initialState` and an optional object containing functions to create getters and/or actions.
 * It creates a Context Provider, implements useContext, and returns a tuple of the Provider and the useStore & setState.
 * @template <T: state type of the store, G: store access methods, A: store mutation methods>
 * @param initialState object to be wrapped in a Store
 * @param createMethods optional object containing functions to create getters and/or actions.
 * @returns a tuple of `[SharedStoreProvider, SharedStore]`
 * @example
 * ```tsx
 * // `counter-store.ts`
 * const [CounterProvider, {useStore: useCounterStore}] = createSharedStore({
 *   value: 5,
 * }, {
 *  getters: state => ({
 *   count: () => state.value,
 *  }),
 *  actions: setState => ({
 *   increment: () => setState(val => ({ ...val, value: val.value + 1 })),
 *   reset: () => setState("value", 0),
 *  })
 * });
 * export { CounterProvider, useCounterStore };
 *
 * // `App.tsx`
 * import { CounterProvider } from './counter-store.ts';
 *
 * // Wrap the app in the store's Provider
 * <CounterProvider>
 *    <App/>
 * </CounterProvider>
 *
 * // `Example.tsx`
 * import { useCounterStore } from './counter-store.ts';
 *
 * const [counterState, {getters: {count}, actions: {increment, reset}}] = useCounterStore();
 * count() // => 5
 * increment()
 * count() // => 6
 * reset() // => 0
 * ```
 */
export function createSharedStore<T extends object>(
  initialState: T
): SharedStoreReturn<T, undefined, undefined>;
export function createSharedStore<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  initialState: T,
  createMethods: SharedStoreMethods<T, G, A>
): SharedStoreReturn<T, undefined extends G ? undefined : G, undefined extends A ? undefined : A>;
export function createSharedStore<
  T extends object,
  G extends object | undefined,
  A extends object | undefined
>(
  initialState: T,
  createMethods?: SharedStoreMethods<T, G | undefined, A | undefined>
): SharedStoreReturn<T, G | undefined, A | undefined> {
  const store = createStore<T>(initialState);
  const [state, setState] = store;
  const getters = createMethods?.getters?.(state);
  const actions = createMethods?.actions?.(setState);
  const methods = {
    getters,
    actions
  };
  type Getters = typeof getters;
  type Actions = typeof actions;
  type Methods = typeof methods;

  const SharedStoreContext = createContext<[state: T, methods: Methods]>([state, methods]);
  const useStore = () => useContext(SharedStoreContext);
  const SharedStoreProvider: FlowComponent<Partial<T>> = props =>
    SharedStoreContext.Provider({
      ...props,
      value: useStore(),
      children: props.children
    });

  return [
    SharedStoreProvider,
    {
      useStore,
      setState
    }
  ] as SharedStoreReturn<T, Getters, Actions>;
}

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
