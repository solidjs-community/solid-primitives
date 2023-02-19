import type { JSX, FlowComponent } from "solid-js";
import { createContext, useContext } from 'solid-js';
import type { SetStoreFunction } from "solid-js/store";
import { createStore, produce as _produce, unwrap as _unwrap } from "solid-js/store";





/**
 * An interface for a set of functions for a store factory
 * 
 * @interface StoreFactoryFunctions
 * @template <T: state type of the store, A: store access/mutation functions>
 * @property {() => [state: T, actions: A]} useStore - A function to retrieve the current state and access/mutation functions
 * @property {(fn: (state: T) => void) => void} produce - A function to execute a callback with the current state
 * @property {() => T} unwrapped - A function to retrieve the current state
 * @property {[get: T, set: SetStoreFunction<T>]} store - A tuple with the current state and a setter for the state
 * @property {T} state - The current state of the store
 * @property {SetStoreFunction<T>} setState - A function to set the current state of the store
 */
export interface StoreFactoryFunctions<T extends object, A extends object | undefined> {
  useStore: () => [state: T, actions: A];
  produce: (fn: (state: T) => void) => void;
  unwrapped: () => T;
  store: [get: T, set: SetStoreFunction<T>];
  state: T;
  setState: SetStoreFunction<T>;
}

/**
 * A tuple for a store factory
 * 
 * @typedef StoreFactory
 * @template <T: state type of the store, A: store access/mutation functions>
 * @property {FlowComponent<Partial<T>>} StoreFactoryProvider - A Flow component that provides partial state to the store
 * @property {StoreFactoryFunctions<T, A>} StoreFactoryFunctions - A set of functions for the store factory
 */
export type StoreFactory<T extends object, A extends object | undefined> = [
  StoreFactoryProvider: FlowComponent<Partial<T>>,
  StoreFactoryFunctions: StoreFactoryFunctions<T, A>
];

/**
 * A function to create actions for a store
 * 
 * @typedef CreateActions
 * @template <T: state type of the store, A: store access/mutation functions>
 * @param {T} state - The current state of the store
 * @param {SetStoreFunction<T>} setState - A function to set the current state of the store
 * @returns {A} A set of actions for the store
 */
export type CreateActions<T extends object, A extends object | undefined> = (state: T, setState: SetStoreFunction<T>) => A;


/**
 * Factory takes an `initialState` and optional access/mutation functions, wraps it in a Store, creates
 * a Context Provider, implements useContext, and returns a tuple of the Provider and the Store.
 * @template <T: state type of the store, A: store access/mutation functions (optional)>
 * @param initialState object to be wrapped in a Store
 * @param createActions optional function that returns an object containing functions that access or
 * modify the state of the store
 * @returns a tuple of `[StoreFactoryProvider, StoreFactoryFunctions]`
 * @example
 * ```tsx
 * // `counter-store.ts`
 * const [CounterProvider, {useStore: useCounterStore}] = createStoreFactory({
 *   value: 5,
 * },
 *   (state, setState) => ({
 *     count: () => state.value,
 *     increment: () => setState(val => ({ value: val.value + 1 })),
 *     reset: () => setState({ value: 0 }),
 *   })
 * );
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
 * const [counterState, {count, increment, reset}] = useCounterStore();
 * count() // => 5
 * increment()
 * count() // => 6
 * reset() // => 0
 * ```
 */
export function createStoreFactory<
  T extends object
>(
  initialState: T
): StoreFactory<T, undefined>;
export function createStoreFactory<
  T extends object,
  A extends object
>(
  initialState: T,
  createActions: CreateActions<T, A>
): StoreFactory<T, A>;
export function createStoreFactory<
  T extends object
>(
  initialState: T,
  createActions: CreateActions<T, any>
): StoreFactory<T, ReturnType<typeof createActions>>;
export function createStoreFactory<
  T extends object,
  A extends object | undefined
>(
  initialState: T,
  createActions?: CreateActions<T, A | undefined>
): StoreFactory<T, A | undefined> {
  const store = createStore<T>(initialState);
  const [state, setState] = store;
  const actions = createActions?.(state, setState);
  type Actions = typeof actions;

  const produce = (fn: (state: T) => void) => setState(_produce<T>(fn));
  const unwrapped = () => _unwrap<T>(state);

  const FactoryContext = createContext<[state: T, actions: Actions]>([ initialState, actions ]);
  const useStore = () => useContext(FactoryContext);
  const StoreFactoryProvider: FlowComponent<Partial<T>> = (props) => FactoryContext.Provider({
    ...props, value: useStore(), children: props.children,
  });

  return [
    StoreFactoryProvider,
    {
      useStore,
      produce,
      unwrapped,
      store,
      state,
      setState,
    }
  ] as StoreFactory<T, Actions>;
}


// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;




