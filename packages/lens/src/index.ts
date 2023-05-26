/* eslint-disable @typescript-eslint/no-unused-vars */

import { JSX } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

// /** @source https://github.com/type-challenges/type-challenges/blob/main/questions/15260-hard-tree-path-array/README.md */
// type Path<T> = T extends Record<PropertyKey, unknown>
//   ? {
//       [P in keyof T]: [P, ...Path<T[P]>] | [P];
//     }[keyof T]
//   : never;

// type Test = Path<{ a: { b: 0 } }>; // ["a", "b"] | ["a"]

// type EvaluatePath<T, P extends PropertyKey[]> = P extends []
//   ? T
//   : P extends [infer K, ...infer Rest]
//   ? K extends keyof T
//     ? Rest extends PropertyKey[] // base case; all path segments consumed
//       ? T // return the type of the current property (specified by key K)
//       : Rest extends PropertyKey[] // recursive case
//       ? EvaluatePath<T[K], Rest>
//       : never // ...Rest was an invalid path (impossible)
//     : never // a path segment was an invalid key
//   : never; // P was not even an array to begin with (impossible)

/** An object path which may or *may not* be valid for a given object. */
type Path = PropertyKey[];

type EvaluatePath<T, P extends Path> = P extends []
  ? T // base case; empty path array (return the whole object)
  : P extends [infer K, ...infer Rest] // bind to array head and tail
  ? K extends keyof T
    ? Rest extends []
      ? T[K] // alternate base case; this is the last path segment
      : Rest extends Path // recursive case
      ? EvaluatePath<T[K], Rest>
      : never // tail was an invalid path (impossible)
    : never // a path segment was an invalid key
  : never; // path was not even an array to begin with (impossible)

type Test2 = EvaluatePath<{ a: { b: { c: number } } }, ["a", "b"]>;
type Test3 = EvaluatePath<{ a: { b: { c: number } } }, ["a"]>;
type Test4 = EvaluatePath<{ a: { b: { c: number } } }, []>;

type FocusedSetter<T, P extends Path> = <P2 extends Path>(
  ...args: [...P2, EvaluatePath<EvaluatePath<T, P>, P2>]
) => void;

// TODO: handle filter functions
// TODO: composability
// TODO: partial `makeFocusedSetter()` function

/**
 * Focuses a Store on a particular path within the object, returning a derived
 * getter and setter.
 *
 * @param store A store getter and setter tuple, as returned by `createStore`
 * @param {...*} path a path array within the store, same as the parameters of `setStore`
 * @return A derived or "focused" Store setter
 */
export const createLens = <T, P extends Path, V extends EvaluatePath<T, P>>(
  store: [get: T, set: SetStoreFunction<T>],
  ...path: P
): [get: V, set: FocusedSetter<T, P>] => {
  const [getStore, setStore] = store;

  // Challenge #1: Evaluate path syntax the way `setStore` does for updating the store
  // https://github.com/solidjs/solid/blob/44a0fdeb585c4f5a3b9bccbf4b7d6c60c7db3ecd/packages/solid/store/src/store.ts#L509
  const get: V = getStore as unknown as V;

  // Challenge #2: Preserve type information for the path syntax of the derived setter
  const set: FocusedSetter<T, P> = (...localPath) => {
    const combinedPath = [...path, ...localPath] as unknown as Parameters<SetStoreFunction<T>>;
    return setStore(...combinedPath);
  };

  return [get, set];
};

type test = FocusedSetter<EvaluatePath<{ a: { b: number } }, ["a"]>, ["b"]>;

// Test code for typechecking:
const [store, setStore] = createStore({ a: { b: { c: { d: 0 } } } });
setStore("a", "b", "c", "d", 1);

const [lens, setLens] = createLens([store, setStore], "a");
setLens("b", "c", "d", 2);

// Tradeoff: no intellisense for path segments

// However, invalid paths will always be marked with a `never` on the final
// setter parameter (since they attempt to assign to a path that doesn't exist)

// Can we do better, and retain intellisense for path segments?

// ...

// While making primitives, there are many patterns in our arsenal
// There are functions like one above, but we also can use components, directives, element properties, etc.
// Solid's tutorial on directives: https://www.solidjs.com/tutorial/bindings_directives
// Example package that uses directives: https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer
// Example use of components: https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/src/components.ts

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
