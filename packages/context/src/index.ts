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
 * Options shared by context provider factories.
 * @param name Debug label passed to the context's underlying Symbol — visible in Solid DevTools
 * and `ContextNotFoundError` stack traces. Dev-mode only; stripped in production.
 */
export type ContextProviderOptions = {
  name?: string;
};

/**
 * Create the Context Provider component and useContext function with types inferred from the factory function.
 * @param factoryFn Factory function will run when the provider component is executed. It takes the provider component `props` as its argument, and what it returns will be available in the contexts for all the underlying components.
 * @param defaults Fallback returned from useContext function if the context wasn't provided.
 * @param options Optional configuration, including a debug `name` for DevTools.
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
  defaults: undefined,
  options?: ContextProviderOptions,
): [provider: ContextProvider<P>, useContext: () => T | undefined];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults: T,
  options?: ContextProviderOptions,
): [provider: ContextProvider<P>, useContext: () => T];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
): [provider: ContextProvider<P>, useContext: () => T | undefined];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults?: T,
  options?: ContextProviderOptions,
): [provider: ContextProvider<P>, useContext: () => T | undefined] {
  const ctx = createContext<T | undefined>(defaults, options);
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

/**
 * Like `createContextProvider`, but the returned hook always returns `T` — if the context is
 * used outside a provider, Solid throws a `ContextNotFoundError` instead of returning
 * `undefined`. Use this when the provider is required by contract.
 *
 * @param factoryFn Factory function run when the provider component mounts. Its return value
 * becomes the context value available to all descendants.
 * @param options Optional configuration, including a debug `name` for DevTools.
 * @returns tuple of `[provider component, useContext function]`
 * @example
 * ```tsx
 * const [AuthProvider, useAuth] = createStrictContextProvider(() => {
 *   const [user, setUser] = createSignal<User | null>(null);
 *   return { user, setUser };
 * }, { name: "Auth" });
 *
 * // throws if used outside <AuthProvider>
 * const { user } = useAuth();
 * ```
 */
export function createStrictContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  options?: ContextProviderOptions,
): [provider: ContextProvider<P>, useContext: () => T] {
  // No default value — getContext throws ContextNotFoundError when not inside a provider
  const ctx = createContext<T>(undefined, options);
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

/**
 * Like `createContextProvider`, but each provider in the tree *extends* the parent context
 * value rather than replacing it. The factory receives the nearest parent's context value,
 * letting it selectively override or merge properties.
 *
 * Useful for incremental overrides — themes, permissions, i18n patches — where a child
 * provider should inherit what it does not explicitly override.
 *
 * @param factoryFn Factory called when the provider mounts. Receives the component `props`
 * and the `parent` context value (or `defaults` at the root). Returns the new context value.
 * @param defaults Base context value used when no parent provider is present.
 * @param options Optional configuration, including a debug `name` for DevTools.
 * @returns tuple of `[provider component, useContext function]`
 * @example
 * ```tsx
 * const [ThemeProvider, useTheme] = createLayeredContext(
 *   (props: { primary?: string }, parent) => ({ ...parent, primary: props.primary ?? parent.primary }),
 *   { primary: "blue", secondary: "gray" },
 * );
 *
 * // Root: { primary: "red", secondary: "gray" }
 * <ThemeProvider primary="red">
 *   // Nested: { primary: "green", secondary: "gray" } — secondary inherited
 *   <ThemeProvider primary="green">
 *     <App />
 *   </ThemeProvider>
 * </ThemeProvider>
 * ```
 */
export function createLayeredContext<T, P extends ContextProviderProps>(
  factoryFn: (props: P, parent: T) => T,
  defaults: T,
  options?: ContextProviderOptions,
): [provider: ContextProvider<P>, useContext: () => T] {
  const ctx = createContext<T>(defaults, options);
  return [
    props => {
      const parent = useContext(ctx);
      return createComponent(ctx, {
        value: factoryFn(props, parent),
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
