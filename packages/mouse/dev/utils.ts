import { ItemsOf } from "@solid-primitives/utils";

export const lerp = (current: number, goal: number, p: number): number =>
  (1 - p) * current + p * goal;

export const objectOmit = <T extends Object, K extends Array<keyof T>>(
  object: T,
  ...keys: K
): Omit<T, ItemsOf<K>> => {
  const copy = Object.assign({}, object);
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
};
