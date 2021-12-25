export const withArrayCopy = <T>(list: readonly T[], fn: (list: T[]) => void): T[] => {
  const copy = list.slice();
  fn(copy);
  return copy;
};

export const push = <T>(list: readonly T[], item: T): T[] =>
  withArrayCopy(list, list => list.push(item));

export const drop = <T>(list: readonly T[], n = 1): T[] => list.slice(n);
