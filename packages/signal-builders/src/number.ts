import { access, accessArray, MaybeAccessor } from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { createMemo } from "solid-js";

/** signal-builder `a + b + c + ...` */
export const add = (...a: MaybeAccessor<number>[]) => createMemo(() => _.add(...accessArray(a)));

/** signal-builder `a - b - c - ...` */
export const substract = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.substract(access(a), ...accessArray(b)));

/** signal-builder `a * b * c * ...` */
export const multiply = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.multiply(access(a), ...accessArray(b)));

/** signal-builder `a / b / c / ...` */
export const divide = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.divide(access(a), ...accessArray(b)));

/** signal-builder `a ** b ** c ** ...` */
export const power = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.power(access(a), ...accessArray(b)));

/** Signal Builder: `Math.round()` */
export const round = (a: MaybeAccessor<number>) => createMemo(() => Math.round(access(a)));
/** Signal Builder: `Math.ceil()` */
export const ceil = (a: MaybeAccessor<number>) => createMemo(() => Math.ceil(access(a)));
/** Signal Builder: `Math.floor()` */
export const floor = (a: MaybeAccessor<number>) => createMemo(() => Math.floor(access(a)));

/**
 * Signal builder: clamps a number value between two other values
 */
export const clamp = (
  value: MaybeAccessor<number>,
  min: MaybeAccessor<number>,
  max: MaybeAccessor<number>
) => createMemo(() => _.clamp(access(value), access(min), access(max)));
