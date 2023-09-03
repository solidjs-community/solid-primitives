import { type UnionToIntersection, identity, emptyObject } from "@solid-primitives/utils";

export type BaseRecordDict = { readonly [K: string | number]: unknown };
export type BaseArrayDict = readonly unknown[];
export type BaseDict = BaseRecordDict | BaseArrayDict;

const isDict = (value: unknown): value is BaseDict =>
  value != null &&
  ((value = Object.getPrototypeOf(value)), value === Array.prototype || value === Object.prototype);

const isRecordDict = (value: unknown): value is BaseRecordDict =>
  value != null && Object.getPrototypeOf(value) === Object.prototype;

export type JoinPath<A, B> = A extends string | number
  ? B extends string | number
    ? `${A}.${B}`
    : A
  : B extends string | number
  ? B
  : "";

export type FlatDict<T extends BaseDict, P = {}> = number extends T
  ? /* catch any */ BaseRecordDict
  : T extends (infer V)[]
  ? /* array */ { readonly [K in JoinPath<P, number>]?: V } & (V extends BaseDict
      ? Partial<FlatDict<V, JoinPath<P, number>>>
      : {})
  : /* record */ UnionToIntersection<
      { [K in keyof T]: T[K] extends BaseDict ? FlatDict<T[K], JoinPath<P, K>> : never }[keyof T]
    > & { readonly [K in keyof T as JoinPath<P, K>]: T[K] };

function visitDict(flat_dict: Record<string, unknown>, dict: BaseDict, path: string): void {
  for (const [key, value] of Object.entries(dict)) {
    const key_path = `${path}.${key}`;
    flat_dict[key_path] = value;
    isDict(value) && visitDict(flat_dict, value, key_path);
  }
}

export function flatten<T extends BaseDict>(dict: T): FlatDict<T> {
  const flat_dict: Record<string, unknown> = { ...dict };
  for (const [key, value] of Object.entries(dict)) {
    isDict(value) && visitDict(flat_dict, value, key);
  }
  return flat_dict as FlatDict<T>;
}

export type BaseTemplateArgs = Record<string, string | number | boolean>;

export type Template<T extends BaseTemplateArgs> = string & { __template_args: T };

export type TemplateArgs<T extends Template<any>> = T extends Template<infer R> ? R : never;

export const template = <T extends BaseTemplateArgs>(source: string): Template<T> => source as any;

export type TemplateResolver = <T extends string>(template: T, ...args: ResolveArgs<T>) => string;

export const resolveTemplate: TemplateResolver = (
  string: string,
  args: BaseTemplateArgs = emptyObject,
) => {
  for (const [key, value] of Object.entries(args)) {
    string = string.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value as string);
  }
  return string;
};

export const identityResolveTemplate = identity as TemplateResolver;

export type Resolved<T> = T extends (...args: any[]) => infer R ? R : T extends string ? string : T;

export type ResolveArgs<T> = T extends (...args: infer A) => any
  ? A
  : T extends Template<infer R>
  ? [args: R]
  : T extends string
  ? [args?: BaseTemplateArgs]
  : [];

export type Resolver<T> = (...args: ResolveArgs<T>) => Resolved<T>;

export type Translator<T extends BaseRecordDict> = <K extends keyof T>(
  path: K,
  ...args: ResolveArgs<T[K]>
) => Resolved<T[K]>;

export type NullableTranslator<T extends BaseRecordDict> = <K extends keyof T>(
  path: K,
  ...args: ResolveArgs<T[K]>
) => Resolved<T[K]> | undefined;

export function translator<T extends BaseRecordDict>(
  dict: () => T,
  resolveTemplate?: TemplateResolver,
): Translator<T>;
export function translator<T extends BaseRecordDict>(
  dict: () => T | undefined,
  resolveTemplate?: TemplateResolver,
): NullableTranslator<T>;
export function translator<T extends BaseRecordDict>(
  dict: () => T | undefined,
  resolveTemplate: TemplateResolver = identityResolveTemplate,
): NullableTranslator<T> {
  return (path, ...args) => {
    const value = dict()?.[path];

    switch (typeof value) {
      case "function":
        return value(...args);
      case "string":
        // @ts-expect-error
        return resolveTemplate(value, args[0]);
      default:
        return value;
    }
  };
}

export type Chained<T extends BaseRecordDict> = {
  readonly [K in keyof T]: T[K] extends BaseRecordDict ? Chained<T[K]> : Resolver<T[K]>;
};

export function chained<T extends BaseRecordDict>(
  init_dict: T,
  translate: Translator<T>,
  path = "",
): Chained<T> {
  const result: any = { ...init_dict };

  for (const [key, value] of Object.entries(init_dict)) {
    const key_path = path ? `${path}.${key}` : key;

    result[key] = isRecordDict(value)
      ? chained(value, translate, key_path)
      : (...args: any[]) =>
          translate(
            key_path,
            // @ts-expect-error
            ...args,
          );
  }

  return result;
}
