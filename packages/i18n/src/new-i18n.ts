import { UnionToIntersection, Simplify } from "@solid-primitives/utils";

export type TemplateArgs<T extends string> = T extends `${string}{{${infer A}}}${infer R}`
  ? { [K in A]: string } & TemplateArgs<R>
  : {};

export function resolvedTemplate<T extends string>(string: T, args: TemplateArgs<T>): string {
  const rgx = /{{([^}]+)}}/g;
  let match: RegExpExecArray | null,
    res = "",
    last_index = 0;
  while ((match = rgx.exec(string))) {
    res += string.slice(last_index, match.index) + args[match[1] as never];
    last_index = match.index + match[0].length;
  }
  return res + string.slice(last_index);
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
export function resolved<T extends string>(string: T, args: TemplateArgs<T>): string;
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

export type ValueResolver<T> = T extends (...args: any[]) => any
  ? T
  : T extends string
  ? (args: TemplateArgs<T>) => string
  : T;

export function resolver<T>(value: T): ValueResolver<T>;
export function resolver(value: unknown): (...args: any[]) => unknown {
  switch (typeof value) {
    case "function":
      return value as never;
    case "string":
      return (args: TemplateArgs<string>) => resolvedTemplate(value, args);
    default:
      return () => value;
  }
}

export type Dict = { readonly [K: string | number]: unknown } | readonly unknown[];

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
