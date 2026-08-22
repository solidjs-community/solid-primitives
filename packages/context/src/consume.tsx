import {
  useContext,
  createMemo,
  type Context,
  type JSX,
  type Accessor,
} from "solid-js";

export type ContextSource<T> = Context<T> | (() => T | undefined) | Accessor<T>;

export type ResolveContextValue<S> = S extends Context<infer T>
  ? T
  : S extends () => infer T
  ? T
  : never;

export type ResolveContextValues<T extends readonly unknown[]> = {
  [K in keyof T]: ResolveContextValue<T[K]>;
};

export interface ConsumeContextPropsSingle<T> {
  use: ContextSource<T>;
  children: (value: T) => JSX.Element;
}

export interface ConsumeContextPropsMultiple<T extends readonly unknown[]> {
  use: { [K in keyof T]: ContextSource<T[K]> };
  children: (values: ResolveContextValues<T>) => JSX.Element;
}

function resolveContext<T>(source: ContextSource<T>): T {
  if (typeof source === "function") {
    return source() as T;
  }
  return useContext(source) as T;
}

/**
 * A reactive JSX component that allows consuming one or multiple contexts directly in JSX without extracting child components.
 * Wrapped in a reactive memo to ensure fine-grained re-renders when context values mutate.
 *
 * @example
 * ```tsx
 * // Single context
 * <ConsumeContext use={useTheme}>
 *   {(theme) => <div class={theme()}>{...}</div>}
 * </ConsumeContext>
 *
 * // Multi context
 * <ConsumeContext use={[useTheme, useAuth]}>
 *   {([theme, auth]) => <div>{auth.user.name} ({theme})</div>}
 * </ConsumeContext>
 * ```
 */
export function ConsumeContext<T>(props: ConsumeContextPropsSingle<T>): JSX.Element;
export function ConsumeContext<T extends readonly unknown[]>(
  props: ConsumeContextPropsMultiple<T>,
): JSX.Element;
export function ConsumeContext(props: {
  use: any;
  children: (val: any) => JSX.Element;
}): JSX.Element {
  const resolved = createMemo(() => {
    const { use } = props;
    if (Array.isArray(use)) {
      return use.map(resolveContext);
    }
    return resolveContext(use);
  });

  return createMemo(() => props.children(resolved())) as unknown as JSX.Element;
}

/**
 * Creates a typed JSX consumer component for a given useContext function or Context object.
 *
 * @param useContextFn The useContext hook function or raw Context object.
 * @returns A JSX component that consumes the context directly.
 */
export function createContextConsumer<T>(
  useContextFn: ContextSource<T>,
): (props: { children: (value: T) => JSX.Element }) => JSX.Element {
  return (props: { children: (value: T) => JSX.Element }) => (
    <ConsumeContext use={useContextFn}>{props.children}</ConsumeContext>
  );
}
