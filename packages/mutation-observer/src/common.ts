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
export type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends Fn ? ReturnType<T> : T;

export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" ? (v as any)() : v;

export const accessAsArray = <T extends MaybeAccessor<any>, V = MaybeAccessorValue<T>>(
  value: T
): V extends any[] ? V : V[] => {
  const _value = access(value);
  return Array.isArray(_value) ? (_value as any) : [_value];
};

export const withAccess = <T, A extends MaybeAccessor<T>, V = MaybeAccessorValue<A>>(
  value: A,
  fn: (value: NonNullable<V>) => void
) => {
  const _value = access(value);
  if (typeof _value !== "undefined" && _value !== null) fn(_value as NonNullable<V>);
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
