import { type AnyFunction, type UnionToIntersection, identity } from "@solid-primitives/utils";

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

export interface ResolverOptions {
  readonly resolvedTemplate?: (template: string, args: BaseTemplateArgs) => string;
}

export const default_resolver_options: ResolverOptions = {
  resolvedTemplate: identity,
};

export type ValueResolver<T> = T extends (...args: any[]) => any
  ? T
  : T extends Template<infer R>
  ? (args: R) => string
  : T extends string
  ? (args?: BaseTemplateArgs) => string
  : () => T;

export function resolver<T>(value: T, options?: ResolverOptions): ValueResolver<T>;
export function resolver(
  value: unknown,
  options: ResolverOptions = default_resolver_options,
): (...args: any[]) => unknown {
  const { resolvedTemplate = identity } = options;
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

export type ResolverDict<T extends BaseDict, TPath = {}> = string extends T
  ? /* catch any */ BaseResolverDict
  : T extends (infer V)[]
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

export interface BaseResolverDict {
  readonly [K: string]: AnyFunction | BaseResolverDict | undefined;
}

let _resolver_options!: ResolverOptions, _flat_dict!: Record<string, unknown>;

function _resolverVisitDict(dict: BaseDict, path: string): void {
  for (const [key, value] of Object.entries(dict)) {
    const key_path = path ? `${path}.${key}` : key;
    _flat_dict[key_path] = resolver(value, _resolver_options);
    isDict(value) && _resolverVisitDict(value, key_path);
  }
}

export function resolverDict<T extends BaseDict>(
  dict: T,
  options: ResolverOptions = default_resolver_options,
): ResolverDict<T> {
  const flat_dict: any = (_flat_dict = { ...dict });
  _resolver_options = options;
  _resolverVisitDict(dict, "");
  _resolver_options = _flat_dict = undefined!;
  return flat_dict;
}

export type Translator<T extends BaseResolverDict> = <K extends keyof T>(
  path: K,
  ...args: T[K] extends AnyFunction ? Parameters<T[K]> : []
) => T[K] extends AnyFunction ? ReturnType<T[K]> : undefined;

export type NullableTranslator<T extends BaseResolverDict> = <K extends keyof T>(
  path: K,
  ...args: T[K] extends AnyFunction ? Parameters<T[K]> : []
) => T[K] extends AnyFunction ? ReturnType<T[K]> | undefined : undefined;

export function translator<T extends BaseResolverDict>(resolverDict: () => T): Translator<T>;
export function translator<T extends BaseResolverDict>(
  resolverDict: () => T | undefined,
): NullableTranslator<T>;
export function translator<T extends BaseResolverDict>(
  resolverDict: () => T | undefined,
): NullableTranslator<T> {
  return (path, ...args) => {
    const resolver = resolverDict()?.[path];
    return resolver ? (resolver as any)(...args) : undefined;
  };
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
