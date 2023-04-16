import type { MaybeAccessor, MaybeAccessorValue } from "@solid-primitives/utils";
import type { Accessor } from "solid-js";

export type RangeProps =
  | { start?: number; to: number; step?: number }
  | [start: MaybeAccessor<number>, to: MaybeAccessor<number>, step?: MaybeAccessor<number>];

export const { abs, sign, min, ceil, floor } = Math;

export const accessor = <T extends MaybeAccessor<unknown>>(a: Accessor<T>) =>
  (typeof a() === "function" ? a() : a.bind(void 0)) as Accessor<MaybeAccessorValue<T>>;

export const toFunction =
  <T, A extends [] | any[]>(a: Accessor<T | ((...args: A) => T)>) =>
  (...args: A) => {
    const v = a();
    return typeof v === "function" ? (v as any)(...args) : v;
  };
