import { identity, type AnyFunction, type UnionToIntersection } from "@solid-primitives/utils";
import { createResource, type Accessor, type InitializedResource } from "solid-js";

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
  readonly resolvedTemplate: (template: string, args: BaseTemplateArgs) => string;
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
  const { resolvedTemplate } = options;
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

export type BaseResolverDict = {
  readonly [K: string]: AnyFunction | BaseResolverDict | undefined;
};

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

export interface I18nOptions<TDict extends BaseDict, TLocale extends string> {
  readonly init_dicts: Partial<Record<TLocale, TDict>>;
  readonly locale: Accessor<TLocale>;
  readonly fetcher: (locale: TLocale) => Promise<TDict | undefined> | TDict | undefined;
  readonly resolver_options?: ResolverOptions;
}

export function createI18n<TDict extends BaseDict, TLocale extends string>(
  options: I18nOptions<TDict, TLocale>,
): InitializedResource<ResolverDict<TDict>> {
  const { init_dicts, locale, fetcher, resolver_options } = options;

  const cache = new SimpleCache<TLocale, ResolverDict<TDict>>(locale => {
    const dict = fetcher(locale);
    if (!dict) return;
    if (dict instanceof Promise)
      return dict.then(
        dict => dict && resolverDict(dict, resolver_options),
        () => undefined,
      );
    return resolverDict(dict, resolver_options);
  });

  let init_dict: ResolverDict<TDict> | undefined;
  const init_locale = locale();

  for (const [key, dict] of Object.entries(init_dicts) as [TLocale, TDict][]) {
    const resolvers = resolverDict(dict, resolver_options);
    cache.map.set(key, resolvers);
    if (key === init_locale) init_dict = resolvers;
  }

  const [dict] = createResource<ResolverDict<TDict>, TLocale>(
    locale,
    (locale, info) => {
      const res = cache.get(locale);
      if (!res) return info.value!;
      if (res instanceof Promise) return res.then(res => res ?? info.value!);
      return res;
    },
    { initialValue: init_dict! },
  );

  return dict;
}

export type Translator<T, TDict extends BaseResolverDict> = <K extends keyof TDict>(
  path: K,
  ...args: TDict[K] extends AnyFunction ? Parameters<TDict[K]> : []
) => TDict[K] extends AnyFunction
  ? T extends undefined
    ? ReturnType<TDict[K]> | undefined
    : ReturnType<TDict[K]>
  : undefined;

export function translator<T extends BaseResolverDict | undefined>(
  resolverDict: () => T,
): Translator<T, Exclude<T, undefined>> {
  return (path, ...args) => {
    const resolver = resolverDict()?.[path as never];
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
