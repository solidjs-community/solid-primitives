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

export const accessAsArray = <T>(value: MaybeAccessor<T[] | T>): T[] => {
  const _value = access(value);
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

export const flipVal = (val: number, min: number, max: number): number =>
  Math.abs(val * (Math.sign(val) || 1) - max) + min;

export const pToVal = (p: number, zero: number, hundred: number): number =>
  p * (hundred - zero) + zero;

export function valToPwMid(
  value: number,
  min: number,
  max: number,
  turn = pToVal(0.5, min, max)
): number {
  if (min > max) {
    [min, max] = [max, min];
    turn = flipVal(turn, min, max);
    value = flipVal(value, min, max);
  }
  return value < turn ? (value - turn) / (turn - min) : (value - turn) / (max - turn);
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

//
// PRIMITIVE SPECIFIC HELPERS:
//
