import * as utils from "@solid-primitives/utils";
import * as solid from "solid-js";

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
  resolvedTemplate: utils.identity,
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
  const { resolvedTemplate = utils.identity } = options;
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
    } & utils.UnionToIntersection<
      {
        [K in keyof T]: T[K] extends BaseDict ? ResolverDict<T[K], JoinPath<TPath, K>> : never;
      }[keyof T]
    >;

export interface BaseResolverDict {
  readonly [K: string]: utils.AnyFunction | BaseResolverDict | undefined;
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

export type I18nFetcher<T extends BaseDict, L extends string> = (
  locale: L,
) => Promise<T | undefined> | T | undefined;

export function createI18n<T extends BaseDict, L extends string>(
  locale: solid.Accessor<L>,
  fetcher: I18nFetcher<T, L>,
  options: solid.InitializedResourceOptions<T, L> & ResolverOptions,
): solid.InitializedResourceReturn<ResolverDict<T>>;

export function createI18n<T extends BaseDict, L extends string>(
  locale: solid.Accessor<L>,
  fetcher: I18nFetcher<T, L>,
  options?: solid.ResourceOptions<T, L> & ResolverOptions,
): solid.ResourceReturn<ResolverDict<T>>;

export function createI18n(
  locale: solid.Accessor<string>,
  fetcher: (locale: string) => Promise<BaseDict | undefined> | BaseDict | undefined,
  options?: solid.ResourceOptions<BaseDict, string> & ResolverOptions,
): solid.ResourceReturn<any> {
  const cache = new SimpleCache<string, BaseResolverDict>(locale => {
    const dict = fetcher(locale);
    if (!dict) return;
    if (dict instanceof Promise)
      return dict.then(
        dict => dict && resolverDict(dict, options),
        () => undefined,
      );
    return resolverDict(dict, options);
  });

  const init_dict = options?.initialValue;
  let init_resolver_dict: BaseResolverDict | undefined;
  init_dict && cache.map.set(locale(), (init_resolver_dict = resolverDict(init_dict, options)));

  return solid.createResource<BaseResolverDict | undefined, string>(
    locale,
    (locale, info) => {
      const res = cache.get(locale);
      if (!res) return info.value;
      if (res instanceof Promise) return res.then(res => res ?? info.value);
      return res;
    },
    { ...(options as any), initialValue: init_resolver_dict },
  );
}

export type Translator<T extends BaseResolverDict> = <K extends keyof T>(
  path: K,
  ...args: T[K] extends utils.AnyFunction ? Parameters<T[K]> : []
) => T[K] extends utils.AnyFunction ? ReturnType<T[K]> : undefined;

export type NullableTranslator<T extends BaseResolverDict> = <K extends keyof T>(
  path: K,
  ...args: T[K] extends utils.AnyFunction ? Parameters<T[K]> : []
) => T[K] extends utils.AnyFunction ? ReturnType<T[K]> | undefined : undefined;

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
