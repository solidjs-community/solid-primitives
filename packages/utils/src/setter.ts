// "The real signal builders"

import { Predicate } from ".";
import * as fp from "./fp";

export const push =
  <T>(item: T) =>
  (list: readonly T[]): T[] =>
    fp.push(list, item);

export const drop =
  (n = 1) =>
  <T>(list: readonly T[]): T[] =>
    fp.drop(list, n);

export const filterOut =
  <T>(item: T) =>
  (list: readonly T[]): T[] & { removed: number } =>
    fp.filterOut(list, item);

export const filter =
  <T>(predicate: Predicate<T>) =>
  (list: readonly T[]): T[] & { removed: number } =>
    fp.filter(list, predicate);

// import { createSignal } from "solid-js";

// const [state, setState] = createSignal([1, 2, 3]);

// setState(push(4));
// setState(drop(1));
// setState(filterOut(1)).removed;
// setState(filter((i: number) => i !== 2)).removed;
