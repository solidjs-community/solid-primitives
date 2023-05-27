/* eslint-disable @typescript-eslint/no-unused-vars */

import { JSX } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

/** @source https://github.com/type-challenges/type-challenges/blob/main/questions/15260-hard-tree-path-array/README.md */
type Path<T> = T extends Record<PropertyKey, unknown>
  ? {
      [P in keyof T]: [P, ...Path<T[P]>] | [P];
    }[keyof T]
  : never;

type EmptyTest = Path<{}>; // never (should it be []?)

const _bigTest: Path<{
  a: {
    a: { a: {}; b: {}; c: {}; d: {}; e: {} };
    b: { a: {}; b: {}; c: {}; d: {}; e: {} };
    c: { a: {}; b: {}; c: {}; d: {}; e: {} };
    d: { a: {}; b: {}; c: {}; d: {}; e: {} };
    e: { a: {}; b: {}; c: {}; d: {}; e: {} };
  };
  b: {
    a: { a: {}; b: {}; c: {}; d: {}; e: {} };
    b: { a: {}; b: {}; c: {}; d: {}; e: {} };
    c: { a: {}; b: {}; c: {}; d: {}; e: {} };
    d: { a: {}; b: {}; c: {}; d: {}; e: {} };
    e: { a: {}; b: {}; c: {}; d: {}; e: {} };
  };
  c: {
    a: { a: {}; b: {}; c: {}; d: {}; e: {} };
    b: { a: {}; b: {}; c: {}; d: {}; e: {} };
    c: { a: {}; b: {}; c: {}; d: {}; e: {} };
    d: { a: {}; b: {}; c: {}; d: {}; e: {} };
    e: { a: {}; b: {}; c: {}; d: {}; e: {} };
  };
  d: {
    a: { a: {}; b: {}; c: {}; d: {}; e: {} };
    b: { a: {}; b: {}; c: {}; d: {}; e: {} };
    c: { a: {}; b: {}; c: {}; d: {}; e: {} };
    d: { a: {}; b: {}; c: {}; d: {}; e: {} };
    e: { a: {}; b: {}; c: {}; d: {}; e: {} };
  };
  e: {
    a: { a: {}; b: {}; c: {}; d: {}; e: {} };
    b: { a: {}; b: {}; c: {}; d: {}; e: {} };
    c: { a: {}; b: {}; c: {}; d: {}; e: {} };
    d: { a: {}; b: {}; c: {}; d: {}; e: {} };
    e: { a: {}; b: {}; c: {}; d: {}; e: {} };
  };
}> = ["b", "d", "a"];

/** Resolves to the type specified by following the path `P` on base type `T`. */
type EvaluatePath<T, P extends Path<T>> = P extends []
  ? T // base case; empty path array (return the whole object)
  : P extends [infer K, ...infer Rest] // bind to array head and tail
  ? K extends keyof T
    ? Rest extends []
      ? T[K] // alternate base case; this is the last path segment
      : Rest extends Path<T[K]> // recursive case
      ? EvaluatePath<T[K], Rest>
      : never // tail was an invalid path (impossible)
    : never // a path segment was an invalid key
  : never; // path was not even an array to begin with (impossible)

type Test2 = EvaluatePath<{ a: { b: { c: number } } }, ["a", "b"]>;
type Test3 = EvaluatePath<{ a: { b: { c: number } } }, ["a"]>;
// type Test4 = EvaluatePath<{ a: { b: { c: number } } }, []>;

/**
 * Given a path within a Store object, return a derived or "focused" getter and setter.
 *
 * @param store A store getter and setter tuple, as returned by `createStore`
 * @param {...*} path a path array within the store, same as the parameters of `setStore`
 * @return A derived or "focused" Store, as a getter & setter tuple
 */
export const createLens = <T, P extends Path<T>, V extends EvaluatePath<T, P>>(
  store: [get: T, set: SetStoreFunction<T>],
  ...path: P
): [get: V, set: SetStoreFunction<V>] => {
  const [getStore, setStore] = store;

  // Challenge #1: Evaluate path syntax the way `setStore` does for updating the store
  // https://github.com/solidjs/solid/blob/44a0fdeb585c4f5a3b9bccbf4b7d6c60c7db3ecd/packages/solid/store/src/store.ts#L509
  const get: V = getStore as unknown as V;

  // Challenge #2: Preserve type information for the path syntax of the derived setter
  const set: SetStoreFunction<V> = (...localPath: any) => {
    const combinedPath = [...path, ...localPath] as unknown as Parameters<SetStoreFunction<T>>;
    return setStore(...combinedPath);
  };

  return [get, set];
};

// Test code for typechecking:
const [store, setStore] = createStore({ a: { b: { c: { d: 0 } } } });
setStore("a", "b", "c", "d", 1);

const [lens, setLens] = createLens([store, setStore], "a");
setLens("b", "c", "d", 2);

// TODO: handle arrays without exploding (???)
// TODO: handle filter functions
// TODO: composability ✅ returns an ordinary `SetStoreFunction`
// TODO: extract partial `makeFocusedSetter()` function

// ...

// While making primitives, there are many patterns in our arsenal
// There are functions like one above, but we also can use components, directives, element properties, etc.
// Solid's tutorial on directives: https://www.solidjs.com/tutorial/bindings_directives
// Example package that uses directives: https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer
// Example use of components: https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/src/components.ts

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
