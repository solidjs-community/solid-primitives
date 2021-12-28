import { produce } from "solid-js/store";
import { Predicate } from ".";

const withCopy = <T extends object>(state: T, fn: (state: T) => void): T =>
  produce(fn)(state as any);

export const push = <T>(list: T[], item: T): T[] => withCopy(list, list => list.push(item));

export const drop = <T>(list: T[], n = 1): T[] => list.slice(n);

export function filterOut<T>(list: readonly T[], item: T): T[] & { removed: number } {
  const newList = list.filter(i => i !== item) as T[] & { removed: number };
  newList.removed = list.length - newList.length;
  return newList;
}

export function filter<T>(list: readonly T[], predicate: Predicate<T>): T[] & { removed: number } {
  const newList = list.filter(predicate) as T[] & { removed: number };
  newList.removed = list.length - newList.length;
  return newList;
}
