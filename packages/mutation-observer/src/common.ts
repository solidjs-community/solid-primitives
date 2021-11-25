import { Accessor } from "solid-js";

//
// GENERAL HELPERS:
//

export type Fn<R = void> = () => R;
/**
 * Infers the element type of an array
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never;
export type MaybeAccessor<T> = T | Accessor<T>;

export const access = <T>(v: MaybeAccessor<T>): T => (typeof v === "function" ? (v as any)() : v);

export const accessAsArray = <T>(value: MaybeAccessor<T>): T extends Array<any> ? T : T[] => {
  const _value = access(value);
  // @ts-ignore
  return Array.isArray(_value) ? _value : [_value];
};

export const withAccess = <T>(value: MaybeAccessor<T>, fn: (value: NonNullable<T>) => void) => {
  const _value = access(value);
  if (typeof _value !== "undefined" && _value !== null) fn(_value as NonNullable<T>);
};

export const promiseTimeout = (
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms)
  );

//
// PRIMITIVE SPECIFIC HELPERS:
//
