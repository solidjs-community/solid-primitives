import { type UnionToIntersection, type AnyFunction } from "@solid-primitives/utils";

export type BaseTemplateArgs = Record<string, string | number | boolean>;

export type Template<T extends BaseTemplateArgs> = string & { __template_args: T };

export type TemplateArgs<T extends Template<any>> = T extends Template<infer R> ? R : never;

export const template = <T extends BaseTemplateArgs>(source: string): Template<T> => source as any;

export function resolvedTemplate<T extends BaseTemplateArgs>(value: Template<T>, args: T): string;
export function resolvedTemplate(string: string, args?: BaseTemplateArgs): string;
export function resolvedTemplate(string: string, args: BaseTemplateArgs = {}): string {
  for (const [key, value] of Object.entries(args)) {
    string = string.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value as string);
  }
  return string;
}

export type ResolvedValue<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends string
  ? string
  : T;

export function resolved<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): ReturnType<T>;
export function resolved<T extends BaseTemplateArgs>(value: Template<T>, args: T): string;
export function resolved(value: string, args?: BaseTemplateArgs): string;
export function resolved<T>(value: T): T;
export function resolved(value: unknown, ...args: any[]): unknown {
  switch (typeof value) {
    case "function":
      return value(...args);
    case "string":
      return resolvedTemplate(value, args[0]);
    default:
      return value;
  }
}

// TODO custom template resolver (different runtime, same type)
export type ValueResolver<T> = T extends (...args: any[]) => any
  ? T
  : T extends Template<infer R>
  ? (args: R) => string
  : T extends string
  ? (args?: BaseTemplateArgs) => string
  : () => T;

export function resolver<T>(value: T): ValueResolver<T>;
export function resolver(value: unknown): (...args: any[]) => unknown {
  switch (typeof value) {
    case "function":
      return value as never;
    case "string":
      return (args: BaseTemplateArgs = {}) => resolvedTemplate(value, args);
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

export type ResolverDict<T extends BaseDict, TPath = {}> = T extends (infer V)[]
  ? /* array */ {
      readonly [K in JoinPath<TPath, number>]?: ValueResolver<V>;
    } & (V extends BaseDict ? Partial<ResolverDict<V, JoinPath<TPath, number>>> : {})
  : /* record */ {
      readonly [K in keyof T as JoinPath<TPath, K>]: ValueResolver<T[K]>;
    } & UnionToIntersection<
      {
        [K in keyof T]: T[K] extends BaseDict ? ResolverDict<T[K], JoinPath<TPath, K>> : never;
      }[keyof T]
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

export type BaseResolverDict = {
  readonly [K: string]: AnyFunction | BaseResolverDict | undefined;
};

export type Translator<T, TDict extends BaseResolverDict> = <K extends keyof TDict>(
  path: K,
  ...args: TDict[K] extends AnyFunction ? Parameters<TDict[K]> : []
) => TDict[K] extends AnyFunction
  ? T extends undefined
    ? ReturnType<TDict[K]> | undefined
    : ReturnType<TDict[K]>
  : undefined;

export function translator<T extends BaseResolverDict | undefined>(
  getResolverDict: () => T,
): Translator<T, Exclude<T, undefined>> {
  return (path, ...args) => {
    const resolver = getResolverDict()?.[path as never];
    return resolver ? (resolver as any)(...args) : undefined;
  };
}

export class SimpleCache<TKey extends string, TValue extends {}> {
  constructor(public fetcher: (key: TKey) => Promise<TValue | undefined> | TValue | undefined) {}

  map: Map<TKey, TValue | Promise<TValue | undefined>> = new Map();

  get(key: TKey): Promise<TValue | undefined> | TValue | undefined {
    const cached = this.map.get(key);
    if (cached) return cached;

    const value = this.fetcher(key);
    if (!value) return;

    this.map.set(key, value);
    if (value instanceof Promise) {
      value.then(
        resolved => resolved && this.map.get(key) === value && this.map.set(key, resolved),
        () => this.map.get(key) === value && this.map.delete(key),
      );
    }

    return value;
  }
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
