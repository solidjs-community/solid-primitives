import { access, accessArray, type MaybeAccessor } from "@solid-primitives/utils";
import * as _ from "@solid-primitives/utils/immutable";
import { type Accessor, createMemo } from "solid-js";

/**
 * Reactive `a + b + c + ...` — also concatenates strings when passed string values.
 * @example
 * const [x, setX] = createSignal(2);
 * const sum = add(x, 3);
 * sum(); // => 5
 */
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

/** Reactive `Math.round()`. */
export const round = (a: MaybeAccessor<number>) => createMemo(() => Math.round(access(a)));

/** Reactive `Math.ceil()`. */
export const ceil = (a: MaybeAccessor<number>) => createMemo(() => Math.ceil(access(a)));

/** Reactive `Math.floor()`. */
export const floor = (a: MaybeAccessor<number>) => createMemo(() => Math.floor(access(a)));

/**
 * Reactively clamps a value between `min` and `max` (inclusive).
 * @example
 * const [val, setVal] = createSignal(15);
 * const clamped = clamp(val, 0, 10);
 * clamped(); // => 10
 */
export const clamp = (
  value: MaybeAccessor<number>,
  min: MaybeAccessor<number>,
  max: MaybeAccessor<number>,
) => createMemo(() => _.clamp(access(value), access(min), access(max)));
