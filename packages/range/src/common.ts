import { MaybeAccessor } from "@solid-primitives/utils";

export type RangeProps =
  | { start?: number; to: number; step?: number }
  | [start: MaybeAccessor<number>, to: MaybeAccessor<number>, step?: MaybeAccessor<number>];
