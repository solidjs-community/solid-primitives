import {
  createContext,
  createComponent,
  merge,
  useContext,
  type Element,
  type Context,
  type ContextProviderComponent,
  type FlowComponent,
} from "solid-js";

// Brands providers created by this package so `MultiProvider` can pass them props instead of a
// `value`. A string key (not a `unique symbol`) keeps the brand identical across duplicate copies
// of this package, both at runtime and in the emitted types.
const $PROVIDER_PROPS = "@solid-primitives/context:provider-props";

export type ContextProviderProps = {
  children?: Element;
} & Record<string, unknown>;
export type ContextProvider<T extends ContextProviderProps> = (
  props: { children: Element } & T,
) => Element;
/**
 * A {@link ContextProvider} created by this package's provider factories. `MultiProvider` passes
 * these their props (`[Provider, props]`) rather than a `value`.
 */
export type CreatedContextProvider<T extends ContextProviderProps> = ContextProvider<T> & {
  readonly [$PROVIDER_PROPS]: true;
};

function brandProvider<P extends ContextProviderProps>(
  provider: ContextProvider<P>,
): CreatedContextProvider<P> {
  return Object.defineProperty(provider, $PROVIDER_PROPS, {
    value: true,
  }) as CreatedContextProvider<P>;
}

/**
 * Options shared by context provider factories.
 * @param name Debug label passed to the context's underlying Symbol — visible in Solid DevTools
 * and `ContextNotFoundError` stack traces. Dev-mode only; stripped in production.
 */
export type ContextProviderOptions = {
  name?: string;
};

const $EMPTY = Symbol("empty-context");

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
 * ctx.count() // => 1
 * ```
 */
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults?: T,
  options?: ContextProviderOptions,
): [provider: CreatedContextProvider<P>, useContext: () => Exclude<T, undefined>] {
  const ctx = createContext<Exclude<T, undefined>>(defaults as Exclude<T, undefined>, options);
  return [
    brandProvider<P>(props => {
      return createComponent(ctx, {
        value: factoryFn(props) as Exclude<T, undefined>,
        get children() {
          return props.children;
        },
      });
    }),
    () => useContext(ctx),
  ];
}

/**
 * Create the Context Provider component and useContext function with types inferred from the factory function.
 *
 * Unlike `createContextProvider`, this primitive represents a missing or undefined context
 * value as `undefined` rather than throwing.
 *
 * @param factoryFn Factory function will run when the provider component is executed.
 * @param defaults Fallback returned from useContext function if the context wasn't provided.
 * @param options Optional configuration, including a debug `name` for DevTools.
 * @returns tuple of `[provider component, useContext function]`
 * @example
 * ```tsx
 * const [UserProvider, useUser] = createOptionalContextProvider(
 *   (props: { id?: string }) => props.id ? { id: props.id } : undefined,
 * );
 *
 * const user = useUser() // => undefined when no provider is present
 * ```
 */
export function createOptionalContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults?: T,
  options?: ContextProviderOptions,
): [provider: CreatedContextProvider<P>, useContext: () => T | undefined] {
  const ctx = createContext<T | typeof $EMPTY>(defaults === undefined ? $EMPTY : defaults, options);
  return [
    brandProvider<P>(props => {
      const value = factoryFn(props);
      return createComponent(ctx, {
        value: value === undefined ? $EMPTY : value,
        get children() {
          return props.children;
        },
      });
    }),
    () => {
      const value = useContext(ctx);
      return value === $EMPTY ? undefined : value;
    },
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
): [provider: CreatedContextProvider<P>, useContext: () => T] {
  const ctx = createContext<T>(defaults, options);
  return [
    brandProvider<P>(props => {
      const parent = useContext(ctx);
      return createComponent(ctx, {
        value: factoryFn(props, parent),
        get children() {
          return props.children;
        },
      });
    }),
    () => useContext(ctx),
  ];
}

/** Validates one `MultiProvider` entry: providers from this package pair with their props, others with a value. */
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

/*

MultiProvider inspired by the preact-multi-provider package from Marvin Hagemeister
See https://github.com/marvinhagemeister/preact-multi-provider


Type validation of the `values` array thanks to the amazing @otonashixav (https://github.com/otonashixav)

*/

/**
 * A component that allows you to provide multiple contexts at once. It will work exactly like nesting multiple providers as separate components, but it will save you from the nesting.
 *
 * @param values Array of `[Context, value]` or `[ContextProviderComponent, value]` tuples,
 * `[Provider, props]` tuples for providers created by `createContextProvider`,
 * `createOptionalContextProvider` or `createLayeredContext`, or bound provider components.
 *
 * @example
 * ```tsx
 * // before
 * <CounterCtx value={1}>
 *   <NameCtx value="John">
 *     <ThemeProvider primary="red">
 *       <App/>
 *     </ThemeProvider>
 *   </NameCtx>
 * </CounterCtx>
 *
 * // after
 * <MultiProvider values={[
 *  [CounterCtx, 1],
 *  [NameCtx, "John"],
 *  [ThemeProvider, { primary: "red" }]
 * ]}>
 *  <App/>
 * </MultiProvider>
 * ```
 */
export function MultiProvider<const T extends readonly unknown[]>(props: {
  values: T & { [K in keyof T]: MultiProviderItem<T[K]> };
  children: Element;
}): Element {
  const { values } = props;
  const fn = (i: number) => {
    let item: any = values[i];

    if (!item) return props.children;

    let ctxProps: { value?: any; children: Element } = {
      get children() {
        return fn(i + 1);
      },
    };
    if (Array.isArray(item)) {
      const [provider, valueOrProps] = item;
      item = provider;
      // Providers from this package take their own props, exactly as when nested directly. `merge`
      // keeps any getters in those props reactive; `children` always comes from `ctxProps`.
      if ($PROVIDER_PROPS in provider) ctxProps = merge(valueOrProps, ctxProps);
      else ctxProps.value = valueOrProps;
    }

    return createComponent(item, ctxProps);
  };
  return fn(0);
}

/**
 * A component that allows you to consume a context without extracting the children into a separate function.
 * This is particularly useful when the context needs to be used within the same JSX where it is provided.
 *
 * The `ContextConsumer` component is equivalent to the following code and solely exists as syntactic sugar:
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
 * @param provider Either one of the following:
 *  - A function that returns the context value. Preferably the `use...()` function returned by `createContextProvider()`.
 *  - The context itself returned by `createContext()`.
 *  - An inline function that returns the context's value.
 *
 * Please note that this prop is not reactive.
 *
 * @param fallback Optional fallback element to render when the context's value is `undefined`. Can be a function or an element. Note that the component still throws a `ContextNotFoundError` if a required context is not provided (or is provided with `undefined`), regardless of the fallback.
 *
 * @example
 * with `createContextProvider`:
 * ```tsx
 * // create the context
 * const [CounterProvider, useCounter] = createContextProvider(...)
 *
 * // provide and use the context
 * <CounterProvider count={1}>
 *   <ContextConsumer provider={useCounter}>
 *     {({ count }) => (
 *       <div>Count: {count()}</div>
 *     )}
 *   </ContextConsumer>
 * </CounterProvider>
 * ```
 *
 * @example
 * with `createOptionalContextProvider` (and `fallback`):
 * ```tsx
 * // create the optional context
 * const [OptionalCounterProvider, useOptionalCounter] = createOptionalContextProvider(...)
 *
 * // provide and use the context
 * <OptionalCounterProvider>
 *   <ContextConsumer provider={useOptionalCounter} fallback={() => (
 *       <div>No counter provided</div>
 *     )}>
 *     {({ count }) => (
 *       <div>Count: {count()}</div>
 *     )}
 *   </ContextConsumer>
 * </OptionalCounterProvider>
 * ```
 *
 * @example
 * with `createContext`:
 * ```tsx
 * // create the context
 * const CounterContext = createContext(...);
 *
 * // provide and use the context
 * <CounterContext value={{ count: 1 }}>
 *   <ContextConsumer provider={CounterContext}>
 *     {({ count }) => (
 *       <div>Count: {count}</div>
 *     )}
 *   </ContextConsumer>
 * </CounterContext>
 * ```
 */
export function ContextConsumer<T>(props: {
  children: (value: T) => Element,
  fallback?: (() => Element) | Element,
  provider: (() => T | undefined) | Context<T>,
}): Element {
  // A required context that is missing (or provided with `undefined`, which Solid treats the same)
  // throws `ContextNotFoundError` from `useContext` (or from the
  // `use...()` hook) right here, before `fallback` is consulted; `fallback` is deliberately not a
  // catch. Only providers that resolve to `undefined` without throwing (optional hooks) reach the
  // fallback branch below, and without a `fallback` they render nothing, like `<Show>`.
  let context: T | undefined;
  if (props.provider.length === 0) {
    context = props.provider(undefined!) as T | undefined;
  } else {
    context = useContext(props.provider as Context<T>);
  }
  if (context === undefined) {
    if (typeof props.fallback === "function") {
      return props.fallback?.();
    }
    return props.fallback;
  }
  return props.children(context);
}
