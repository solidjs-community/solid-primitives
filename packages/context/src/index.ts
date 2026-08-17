import {
  createContext,
  createComponent,
  mergeProps,
  useContext,
  type JSX,
  type Context,
  type FlowComponent,
} from "solid-js";
import type { ContextProviderComponent } from "../node_modules/solid-js/types/reactive/signal.js";

const $PROVIDER_PROPS = Symbol("provider-props");

export type ContextProviderProps = {
  children?: JSX.Element;
} & Record<string, unknown>;
export type ContextProvider<T extends ContextProviderProps> = (
  props: { children: JSX.Element } & T,
) => JSX.Element;
type CreatedContextProvider<T extends ContextProviderProps> = ContextProvider<T> & {
  readonly [$PROVIDER_PROPS]: true;
};

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
): [provider: CreatedContextProvider<P>, useContext: () => T];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
): [provider: CreatedContextProvider<P>, useContext: () => T | undefined];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults?: T,
): [provider: CreatedContextProvider<P>, useContext: () => T | undefined] {
  const ctx = createContext(defaults);
  const Provider = (props => {
    return createComponent(ctx.Provider, {
      value: factoryFn(props),
      get children() {
        return props.children;
      },
    });
  }) as CreatedContextProvider<P>;
  Object.defineProperty(Provider, $PROVIDER_PROPS, { value: true });
  return [Provider, () => useContext(ctx)];
}

/*

MultiProvider inspired by the preact-multi-provider package from Marvin Hagemeister
See https://github.com/marvinhagemeister/preact-multi-provider


Type validation of the `values` array thanks to the amazing @otonashixav (https://github.com/otonashixav)

*/

/**
 * A component that allows you to provide multiple contexts at once. It will work exactly like nesting multiple providers as separate components, but it will save you from the nesting.
 *
 * @param values Array of context/value tuples, `createContextProvider` provider/props tuples, or bound provider components.
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
 *  [NameCtx.Provider, "John"],
 *  [CounterProvider, { initial: 1 }]
 * ]}>
 *  <App/>
 * </MultiProvider>
 * ```
 */
type MultiProviderItem<T> = T extends readonly [infer Provider, unknown]
  ? Provider extends CreatedContextProvider<infer ProviderProps>
    ? readonly [Provider, Omit<ProviderProps, "children">]
    : Provider extends Context<infer Value>
      ? readonly [Provider, Value]
      : Provider extends ContextProviderComponent<infer Value>
        ? readonly [Provider, Value]
        : never
  : T extends FlowComponent
    ? T
    : never;

export function MultiProvider<const T extends readonly unknown[]>(props: {
  values: T & { [K in keyof T]: MultiProviderItem<T[K]> };
  children: JSX.Element;
}): JSX.Element {
  const { values } = props;
  const fn = (i: number) => {
    let item: any = values[i];

    if (!item) return props.children;

    let ctxProps: { value?: any; children: JSX.Element } = {
      get children() {
        return fn(i + 1);
      },
    };
    if (Array.isArray(item)) {
      const value = item[1];
      item = item[0];
      if (typeof item === "function" && $PROVIDER_PROPS in item) {
        ctxProps = mergeProps(value, ctxProps);
      } else {
        ctxProps.value = value;
        if (typeof item !== "function") item = item.Provider;
      }
    }

    return createComponent(item, ctxProps);
  };
  return fn(0);
}
