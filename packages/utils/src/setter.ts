// "The real signal builders"

import { Predicate, MappingFn } from ".";
import * as fp from "./fp";

export const push =
  <T>(item: T) =>
  (list: T[]): T[] =>
    fp.push(list, item);

export const drop =
  (n = 1) =>
  <T>(list: T[]): T[] =>
    fp.drop(list, n);

export const filterOut =
  <T>(item: T) =>
  (list: T[]): T[] & { removed: number } =>
    fp.filterOut(list, item);

export const filter =
  <T>(predicate: Predicate<T>) =>
  (list: T[]): T[] & { removed: number } =>
    fp.filter(list, predicate);

export const map =
  <T>(mapFn: MappingFn<T, T>) =>
  (list: T[]): T[] =>
    list.map(mapFn);

export const slice =
  (start?: number, end?: number) =>
  <T>(list: T[]): T[] =>
    list.slice(start, end);

export function splice(start: number, deleteCount: number): <T>(list: T[]) => T[];
export function splice<T>(start: number, deleteCount: number, ...items: T[]): (list: T[]) => T[];
export function splice<T>(start: number, deleteCount: number, ...items: T[]): (list: T[]) => T[] {
  return list => fp.splice(list, start, deleteCount, ...items);
}

// import { createSignal } from "solid-js";

// const [state, setState] = createSignal([1, 2, 3]);

// setState(push(4));
// setState(drop(1));
// setState(filterOut(1)).removed;
// setState(filter((i: number, index, arr) => i !== 2)).removed;
// setState(map((i: number, index, arr) => i + 1));
// setState(splice(2, 1));
// setState(slice(1, 2));
