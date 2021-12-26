import { Predicate } from ".";

export const withArrayCopy = <T>(list: readonly T[], fn: (list: T[]) => void): T[] => {
  const copy = list.slice();
  fn(copy);
  return copy;
};

export const push = <T>(list: readonly T[], item: T): T[] =>
  withArrayCopy(list, list => list.push(item));

export const drop = <T>(list: readonly T[], n = 1): T[] => list.slice(n);

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
