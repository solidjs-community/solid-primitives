import { JSX } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

/** @source https://github.com/type-challenges/type-challenges/blob/main/questions/15260-hard-tree-path-array/README.md */
type Path<T> = T extends Record<PropertyKey, unknown>
  ? {
      [P in keyof T]: [P, ...Path<T[P]>] | [P];
    }[keyof T]
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Test = Path<{ a: { b: 0 } }>; // ["a", "b"] | ["a"]

type EvaluatePath<T, P extends Path<T>> = P extends [infer K, ...infer Rest]
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? EvaluatePath<T[K], Rest>
      : T[K]
    : never
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Test2 = EvaluatePath<{ a: { b: number } }, ["a", "b"]>;

type FocusedSetter<T> = (...args: Path<T>) => void;

// TODO: handle filter functions

/**
 * Focuses a Store on a particular path within the object, returning a derived
 * getter and setter.
 *
 * @param store A store getter and setter tuple, as returned by `createStore`
 * @param {...*} path a path array within the store, same as the parameters of `setStore`
 * @return A derived or "focused" Store setter
 */
export const createLens = <T, V extends EvaluatePath<T, Path<T>>>(
  store: [get: T, set: SetStoreFunction<T>],
  ...path: Path<T>
): [get: V, set: FocusedSetter<V>] => {
  const [getStore, setStore] = store;

  // Challenge #1: Evaluate path syntax the way `setStore` does for updating the store
  // https://github.com/solidjs/solid/blob/44a0fdeb585c4f5a3b9bccbf4b7d6c60c7db3ecd/packages/solid/store/src/store.ts#L509
  const get: V = getStore as unknown as V;

  // Challenge #2: Preserve type information for the path syntax of the derived setter
  const set: FocusedSetter<V> = (...localPath: Path<V>) => {
    const combinedPath = [...path, ...localPath] as unknown as Parameters<SetStoreFunction<T>>;
    return setStore(...combinedPath);
  };

  return [get, set];
};

// Test code for typechecking:
const [store, setStore] = createStore({ a: { b: 0 } });
setStore("a", "b", 1);

const [lens, setLens] = createLens([store, setStore], "a");

// While making primitives, there are many patterns in our arsenal
// There are functions like one above, but we also can use components, directives, element properties, etc.
// Solid's tutorial on directives: https://www.solidjs.com/tutorial/bindings_directives
// Example package that uses directives: https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer
// Example use of components: https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/src/components.ts

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
