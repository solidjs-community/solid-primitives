import { createMemo, type Accessor } from "solid-js";
import { type MaybeAccessor, access } from "@solid-primitives/utils";

export * from "./math.js";

export function range(to: number): number[];
export function range(from: number, to: number, step?: number): number[];
export function range(from: number, to?: number, step: number = 1): number[] {
  if (typeof to === "undefined") {
    to = from;
    from = 0;
  }
  return Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (v, i) => from + i * step,
  );
}

export function createRange(to: MaybeAccessor<number>): Accessor<number[]>;
export function createRange(
  from: MaybeAccessor<number>,
  to: MaybeAccessor<number>,
  step?: MaybeAccessor<number>,
): Accessor<number[]>;
export function createRange(
  from: MaybeAccessor<number>,
  to?: MaybeAccessor<number>,
  step: MaybeAccessor<number> = 1,
): Accessor<number[]> {
  if (typeof to === "undefined") {
    return createMemo(() => range(access(from)));
  }
  return createMemo(() => range(access(from), access(to), access(step)));
}
