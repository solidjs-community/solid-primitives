import {
  createContext,
  createComponent,
  useContext,
  type Element,
  type Context,
  type ContextProviderComponent,
  type FlowComponent,
} from "solid-js";

export type ContextProviderProps = {
  children?: Element;
} & Record<string, unknown>;
export type ContextProvider<T extends ContextProviderProps> = (
  props: { children: Element } & T,
) => Element;

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
  const ctx = createContext<T | undefined>(defaults);
  return [
    props => {
      return createComponent(ctx, {
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
 * <CounterCtx value={1}>
 *   <NameCtx value="John">
 *     <App/>
 *   </NameCtx>
 * </CounterCtx>
 *
 * // after
 * <MultiProvider values={[
 *  [CounterCtx, 1],
 *  [NameCtx, "John"]
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
  children: Element;
}): Element {
  const { values } = props;
  const fn = (i: number) => {
    let item: any = values[i];

    if (!item) return props.children;

    const ctxProps: { value?: any; children: Element } = {
      get children() {
        return fn(i + 1);
      },
    };
    if (Array.isArray(item)) {
      ctxProps.value = item[1];
      item = item[0];
    }

    return createComponent(item, ctxProps);
  };
  return fn(0);
}
