import { UnionToIntersection, Simplify } from "@solid-primitives/utils";

export type Template<
  TBefore extends string = string,
  TArg extends string = string,
  TAfter extends string = string,
> = `${TBefore}{{${TArg}}}${TAfter}`;

// TODO handle spaces
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

export type BaseRecordDict = { readonly [K: string | number]: unknown };
export type BaseArrayDict = readonly unknown[];
export type BaseDict = BaseRecordDict | BaseArrayDict;

function isDict(value: unknown): value is BaseDict {
  let proto: any;
  return (
    value != null &&
    ((proto = Object.getPrototypeOf(value)),
    proto === Array.prototype || proto === Object.prototype)
  );
}

function isRecordDict(value: unknown): value is BaseRecordDict {
  return value != null && Object.getPrototypeOf(value) === Object.prototype;
}

export type JoinPath<A, B> = A extends string | number
  ? B extends string | number
    ? `${A}.${B}`
    : A
  : B extends string | number
  ? B
  : "";

export type ResolverDict<T extends BaseDict, TPath = {}> = Simplify<
  T extends (infer V)[]
    ? /* array */ {
        readonly [K in JoinPath<TPath, number>]?: ValueResolver<V>;
      } & (V extends BaseDict ? Partial<ResolverDict<V, JoinPath<TPath, number>>> : {})
    : /* record */ {
        readonly [K in keyof T as JoinPath<TPath, K>]: ValueResolver<T[K]>;
      } & UnionToIntersection<
        {
          [K in keyof T]: T[K] extends BaseDict ? ResolverDict<T[K], JoinPath<TPath, K>> : never;
        }[keyof T]
      >
>;

function resolverVisitDict(flat_dict: Record<string, unknown>, dict: BaseDict, path: string): void {
  for (const [key, value] of Object.entries(dict)) {
    const key_path = path ? `${path}.${key}` : key;
    flat_dict[key_path] = resolver(value);
    isDict(value) && resolverVisitDict(flat_dict, value, key_path);
  }
}

export function resolverDict<T extends BaseDict>(dict: T): ResolverDict<T> {
  const flat_dict: Record<string, unknown> = { ...dict };
  resolverVisitDict(flat_dict, dict, "");
  return flat_dict as any;
}

export type ChainedResolver<T extends BaseRecordDict> = {
  readonly [K in keyof T]: T[K] extends BaseRecordDict
    ? ChainedResolver<T[K]>
    : ValueResolver<T[K]>;
};

export function chainedResolver<T extends BaseRecordDict>(
  init_dict: T,
  resolvedValue: (path: string, ...args: unknown[]) => unknown,
  path = "",
): ChainedResolver<T> {
  const flat_dict: Record<string, unknown> = { ...init_dict };
  for (const [key, value] of Object.entries(init_dict)) {
    const key_path = path ? `${path}.${key}` : key;
    flat_dict[key] = isRecordDict(value)
      ? chainedResolver(value, resolvedValue, key_path)
      : (...args: any[]) => resolvedValue(key_path, ...args);
  }
  return flat_dict as any;
}
