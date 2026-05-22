import { access, accessArray, type MaybeAccessor } from "@solid-primitives/utils";
import * as _ from "@solid-primitives/utils/immutable";
import { type Accessor, createMemo } from "solid-js";

/** `a + b + c + ...` */
export function add(...a: MaybeAccessor<number>[]): Accessor<number>;
export function add(...a: MaybeAccessor<string>[]): Accessor<string>;
export function add(...a: MaybeAccessor<any>[]): Accessor<string | number> {
  return createMemo(() => _.add(...accessArray(a)));
}

/** `a - b - c - ...` */
export const substract = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.substract(access(a), ...accessArray(b)));

/** `a * b * c * ...` */
export const multiply = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.multiply(access(a), ...accessArray(b)));

/** `a / b / c / ...` */
export const divide = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.divide(access(a), ...accessArray(b)));

/** `a ** b ** c ** ...` */
export const power = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.power(access(a), ...accessArray(b)));

export const round = (a: MaybeAccessor<number>) => createMemo(() => Math.round(access(a)));
export const ceil = (a: MaybeAccessor<number>) => createMemo(() => Math.ceil(access(a)));
export const floor = (a: MaybeAccessor<number>) => createMemo(() => Math.floor(access(a)));

export const clamp = (
  value: MaybeAccessor<number>,
  min: MaybeAccessor<number>,
  max: MaybeAccessor<number>,
) => createMemo(() => _.clamp(access(value), access(min), access(max)));
