import { UnionToIntersection, Simplify } from "@solid-primitives/utils";

export type Template<
  TBefore extends string = string,
  TArg extends string = string,
  TAfter extends string = string,
> = `${TBefore}{{${TArg}}}${TAfter}`;

export type TemplateArgs<T extends string> = T extends Template<string, infer A, infer R>
  ? { [K in A]: string } & TemplateArgs<R>
  : {};

export function resolvedTemplate<T extends string>(string: T, args: TemplateArgs<T>): string {
  for (const [key, value] of Object.entries(args)) {
    string = string.replace(`{{${key}}}`, value as string) as T;
  }
  return string;
}

export type ResolvedValue<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends string
  ? string
  : T;

export function resolved<T extends string>(
  string: T,
  ..._: T extends Template ? [args: TemplateArgs<T>] : [args?: {}]
): string;
export function resolved<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): ReturnType<T>;
export function resolved<T>(value: T extends string ? never : T): T;
export function resolved(value: unknown, ...args: any[]): unknown {
  switch (typeof value) {
    case "function":
      return value(...args);
    case "string":
      return resolvedTemplate(value, args[0] ?? {});
    default:
      return value;
  }
}

export type ValueResolver<T> = T extends (...args: any[]) => any
  ? T
  : T extends Template
  ? (args: TemplateArgs<T>) => string
  : (args?: {}) => T;

export function resolver<T>(value: T): ValueResolver<T>;
export function resolver(value: unknown): (...args: any[]) => unknown {
  switch (typeof value) {
    case "function":
      return value as never;
    case "string":
      return (args: TemplateArgs<string> = {}) => resolvedTemplate(value, args);
    default:
      return () => value;
  }
}

export type RecordDict = { readonly [K: string | number]: unknown };
export type ArrayDict = readonly unknown[];
export type Dict = RecordDict | ArrayDict;

export type JoinPath<A, B> = A extends string | number
  ? B extends string | number
    ? `${A}.${B}`
    : A
  : B extends string | number
  ? B
  : "";

export type FlatDict<TDict extends Dict, TPath = {}> = Simplify<
  TDict extends (infer V)[]
    ? { [K in JoinPath<TPath, number>]?: V } & (V extends Dict
        ? Partial<FlatDict<V, JoinPath<TPath, number>>>
        : {})
    : UnionToIntersection<
        {
          [K in keyof TDict]: TDict[K] extends Dict
            ? FlatDict<TDict[K], JoinPath<TPath, K>>
            : never;
        }[keyof TDict]
      > & {
        [K in keyof TDict as JoinPath<TPath, K>]: TDict[K];
      }
>;

function isDict(value: unknown): value is Dict {
  let proto: any;
  return (
    value != null &&
    ((proto = Object.getPrototypeOf(value)),
    proto === Array.prototype || proto === Object.prototype)
  );
}

function visitDict(flat_dict: Record<string, unknown>, dict: Dict, path: string): void {
  for (const [key, value] of Object.entries(dict)) {
    const key_path = `${path}.${key}`;
    flat_dict[key_path] = value;
    isDict(value) && visitDict(flat_dict, value, key_path);
  }
}

export function flatDict<T extends Dict>(dict: T): FlatDict<T> {
  const flat_dict: Record<string, unknown> = { ...dict };
  for (const [key, value] of Object.entries(dict)) {
    isDict(value) && visitDict(flat_dict, value, key);
  }
  return flat_dict as FlatDict<T>;
}

export type ResolverDict<T extends RecordDict> = {
  [K in keyof T]: ValueResolver<T[K]>;
};

export function resolverDict<T extends RecordDict>(dict: T): ResolverDict<T> {
  const resolvers: Record<string, unknown> = { ...dict };
  for (const [key, value] of Object.entries(dict)) {
    resolvers[key] = resolver(value);
  }
  return resolvers as ResolverDict<T>;
}
