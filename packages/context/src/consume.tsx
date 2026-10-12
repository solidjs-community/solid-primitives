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

export function createContextConsumer<T>(
  useContextFn: ContextSource<T>,
): (props: { children: (value: T) => JSX.Element }) => JSX.Element {
  return (props: { children: (value: T) => JSX.Element }) => (
    <ConsumeContext use={useContextFn}>{props.children}</ConsumeContext>
  );
}
