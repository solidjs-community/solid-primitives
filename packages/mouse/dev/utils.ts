import { ItemsOf } from "@solid-primitives/utils";

export const lerp = (current: number, goal: number, p: number): number =>
  (1 - p) * current + p * goal;
