export const updateItem = <T>(array: readonly T[], index: number, fn: (item: T) => T): T[] => {
  const copy = array.slice();
  const newItem = fn(array[index]);
  copy.splice(index, 1, newItem);
  return copy;
};

export const toggleItems = (array: readonly boolean[], toggle: number[]): boolean[] => {
  if (!toggle.length) return array as boolean[];
  const copy = array.slice();
  toggle.forEach(i => (copy[i] = !copy[i]));
  return copy;
};
