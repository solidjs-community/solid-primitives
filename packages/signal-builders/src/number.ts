import { access, accessArray, MaybeAccessor } from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { createMemo } from "solid-js";

export const add = (...a: MaybeAccessor<number>[]) => createMemo(() => _.add(...accessArray(a)));

export const substract = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.substract(access(a), ...accessArray(b)));

export const multiply = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.multiply(access(a), ...accessArray(b)));

export const divide = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.divide(access(a), ...accessArray(b)));

export const power = (a: MaybeAccessor<number>, ...b: MaybeAccessor<number>[]) =>
  createMemo(() => _.power(access(a), ...accessArray(b)));

export const round = (a: MaybeAccessor<number>) => createMemo(() => Math.round(access(a)));
export const ceil = (a: MaybeAccessor<number>) => createMemo(() => Math.ceil(access(a)));
export const floor = (a: MaybeAccessor<number>) => createMemo(() => Math.floor(access(a)));
