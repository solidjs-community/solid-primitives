import { type ArrayFilterFn, type StorePathRange } from "solid-js/store";

/** @source https://github.com/type-challenges/type-challenges/blob/main/questions/15260-hard-tree-path-array/README.md */
export type StorePath<T> = T extends readonly unknown[]
  ? [number] | [ArrayFilterFn<T[number]>] | [StorePathRange] | [number, ...StorePath<T[number]>]
  : T extends Record<PropertyKey, unknown>
  ? {
      [P in keyof T]: [P] | [P, ...StorePath<T[P]>];
    }[keyof T]
  : never;

type ArrayTest = StorePath<number[]>;
type ArrayTest2 = StorePath<number[][]>;
type EmptyTest = StorePath<{}>; // never (should it be []?)
type MultipleFilterTest = StorePath<number[][]>;

/** Resolves to the type specified by following the path `P` on base type `T`. */
export type EvaluatePath<T, P extends StorePath<T>> = T extends unknown[]
  ? EvaluateArrayPath<T, P>
  : T extends Record<PropertyKey, unknown>
  ? EvaluateObjectPath<T, P>
  : T;

type Test2 = EvaluatePath<{ a: { b: { c: number } } }, ["a", "b"]>;
type Test3 = EvaluatePath<{ a: { b: { c: number } } }, ["a"]>;
type Test4 = EvaluatePath<[{ a: 1 }, { a: 2 }, { a: 3 }], [0, "a"]>;

export type EvaluateObjectPath<
  T extends Record<PropertyKey, unknown>,
  P extends StorePath<T>,
> = P extends []
  ? T // base case; empty path array (return the whole object)
  : P extends [infer K, ...infer Rest] // bind to array head and tail
  ? K extends keyof T
    ? Rest extends []
      ? T[K] // alternate base case; this is the last path segment
      : Rest extends StorePath<T[K]> // recursive case
      ? EvaluatePath<T[K], Rest>
      : never // tail was an invalid path (impossible)
    : never // a path segment was an invalid key
  : never; // path was not even an array to begin with (impossible)

export type EvaluateArrayPath<T extends unknown[], P extends StorePath<T>> = P extends [
  infer K,
  ...infer Rest,
]
  ? K extends never
    ? T // base case; empty path array (return the whole type)
    : K extends number
    ? Rest extends StorePath<T[K]>
      ? EvaluatePath<T[K], Rest>
      : Rest extends []
      ? T[K]
      : never // Three repeated edge-cases: last array item
    : K extends ArrayFilterFn<T[number]>
    ? Rest extends StorePath<T>
      ? EvaluatePath<T[number], Rest> // ⚠ self-recursion/infinite regress
      : // ❕ Resolved by disallowing repeated filter functions or ranges
      Rest extends []
      ? T
      : never // Three repeated edge-cases: last array item
    : K extends StorePathRange
    ? Rest extends StorePath<T>
      ? EvaluatePath<T[number], Rest> // ⚠ self-recursion/infinite regress
      : // ❕ Resolved by disallowing repeated filter functions or ranges
      Rest extends []
      ? T
      : never // Three repeated edge-cases: last array item
    : never // unsupported array index
  : never; // not an array (impossible)

type TestArray = EvaluateArrayPath<[1, 2, 3], [0]>; // number
type TestNestedArray = EvaluateArrayPath<number[][], [number, number]>; // number

// const _bigTest: Path<{
//   a: {
//     a: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     b: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     c: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     d: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     e: { a: {}; b: {}; c: {}; d: {}; e: {} };
//   };
//   b: {
//     a: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     b: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     c: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     d: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     e: { a: {}; b: {}; c: {}; d: {}; e: {} };
//   };
//   c: {
//     a: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     b: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     c: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     d: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     e: { a: {}; b: {}; c: {}; d: {}; e: {} };
//   };
//   d: {
//     a: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     b: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     c: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     d: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     e: { a: {}; b: {}; c: {}; d: {}; e: {} };
//   };
//   e: {
//     a: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     b: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     c: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     d: { a: {}; b: {}; c: {}; d: {}; e: {} };
//     e: { a: {}; b: {}; c: {}; d: {}; e: {} };
//   };
// }> = ["b", "d", "a"];
