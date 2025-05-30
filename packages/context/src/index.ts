import { createContext, createComponent, useContext, JSX, Context, FlowComponent } from "solid-js";
import type { ContextProviderComponent } from "../node_modules/solid-js/types/reactive/signal.js";

export type ContextProviderProps = {
  children?: JSX.Element;
} & Record<string, unknown>;
export type ContextProvider<T extends ContextProviderProps> = (
  props: { children: JSX.Element } & T,
) => JSX.Element;

/**
 * Create the Context Provider component and useContext function with types inferred from the factory function.
 * @param factoryFn Factory function will run when the provider component in executed. It takes the provider component `props` as it's argument, and what it returns will be available in the contexts for all the underlying components.
 * @param defaults fallback returned from useContext function if the context wasn't provided
 * @returns tuple of `[provider component, useContext function]`
 * @example
 * ```tsx
 * const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
 *    const [count, setCount] = createSignal(props.initial);
 *    const increment = () => setCount(count() + 1)
 *    return { count, increment };
 * });
 * // Provide the context
 * <CounterProvider initial={1}>
 *    <App/>
 * </CounterProvider>
 * // get the context
 * const ctx = useCounter()
 * ctx?.count() // => 1
 * ```
 */
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults: T,
): [provider: ContextProvider<P>, useContext: () => T];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
): [provider: ContextProvider<P>, useContext: () => T | undefined];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults?: T,
): [provider: ContextProvider<P>, useContext: () => T | undefined] {
  const ctx = createContext(defaults);
  return [
    props => {
      return createComponent(ctx.Provider, {
        value: factoryFn(props),
        get children() {
          return props.children;
        },
      });
    },
    () => useContext(ctx),
  ];
}

/*

MultiProvider inspired by the preact-multi-provider package from Marvin Hagemeister
See https://github.com/marvinhagemeister/preact-multi-provider


Type validation of the `values` array thanks to the amazing @otonashixav (https://github.com/otonashixav)

*/

/**
 * A component that allows you to provide multiple contexts at once. It will work exactly like nesting multiple providers as separate components, but it will save you from the nesting.
 *
 * @param values Array of tuples of `[ContextProviderComponent, value]` or `[Context, value]` or bound `ContextProviderComponent` (that doesn't take a `value` property).
 *
 * @example
 * ```tsx
 * // before
 * <CounterCtx.Provider value={1}>
 *   <NameCtx.Provider value="John">
 *     <App/>
 *   </NameCtx.Provider>
 * </CounterCtx.Provider>
 *
 * // after
 * <MultiProvider values={[
 *  [CounterCtx.Provider, 1],
 *  [NameCtx.Provider, "John"]
 * ]}>
 *  <App/>
 * </MultiProvider>
 * ```
 */
export function MultiProvider<T extends readonly [unknown?, ...unknown[]]>(props: {
  values: {
    [K in keyof T]:
      | readonly [
          Context<T[K]> | ContextProviderComponent<T[K]>,
          [T[K]][T extends unknown ? 0 : never],
        ]
      | FlowComponent;
  };
  children: JSX.Element;
}): JSX.Element {
  const { values } = props;
  const fn = (i: number) => {
    let item: any = values[i];

    if (!item) return props.children;

    const ctxProps: { value?: any; children: JSX.Element } = {
      get children() {
        return fn(i + 1);
      },
    };
    if (Array.isArray(item)) {
      ctxProps.value = item[1];
      item = item[0];
      if (typeof item !== "function") item = item.Provider;
    }

    return createComponent(item, ctxProps);
  };
  return fn(0);
}

/**
 * A component that allows you to consume a context without extracting the children into a separate function.
 * This is particularly useful when the context needs to be used within the same JSX where it is provided.
 *
 * The `ConsumeContext` component is equivalent to the following code and solely exists as syntactic sugar:
 *
 * ```tsx
 * <CounterProvider>
 *   {untrack(() => {
 *     const context = useContext(counterContext); // or useCounter()
 *     return children(context);
 *   })}
 * </CounterProvider>
 * ```
 *
 * @param use Either one of the following:
 *  - A function that returns the context value. Preferably the `use...()` function returned from `createContextProvider()`.
 *  - The context itself returned from `createContext()`.
 *  - A inline function that returns the context value.
 *
 * @example
 * ```tsx
 * // create the context
 * const [CounterProvider, useCounter] // = createContextProvider(...)
 *
 * // provide and use the context
 * <CounterProvider count={1}>
 *   <ConsumeContext use={useCounter}>
 *     {({ count }) => (
 *       <div>Count: {count()}</div>
 *     )}
 *   </ConsumeContext>
 * </CounterProvider>
 * ```
 *
 * ```tsx
 * // create the context
 * const counterContext = createContext({ count: 0 });
 *
 * // provide and use the context
 * <counterContext.Provider value={{ count: 1 }}>
 *   <ConsumeContext use={counterContext}>
 *     {({ count }) => (
 *       <div>Count: {count}</div>
 *     )}
 *   </ConsumeContext>
 * </counterContext.Provider>
 * ```
 */
export function ConsumeContext<T>(props: {
  children: (value: T | undefined) => JSX.Element,
  use: (() => T | undefined) | Context<T>,
}): JSX.Element {
  let context: T | undefined;
  if (typeof props.use === "function") {
    context = props.use();
  } else {
    context = useContext(props.use);
  }
  return props.children(context);
}
