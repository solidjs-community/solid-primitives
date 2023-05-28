import { JSX } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { type EvaluateAnyPath, type Path } from "./types";

/**
 * Given a path within a Store object, return a derived or "focused" getter and setter.
 *
 * @param store A store getter and setter tuple, as returned by `createStore`
 * @param {...*} path a path array within the store, same as the parameters of `setStore`
 * @return A derived or "focused" Store, as a getter & setter tuple
 */
export const createLens = <T, P extends Path<T>, V extends EvaluateAnyPath<T, P>>(
  store: [get: T, set: SetStoreFunction<T>],
  ...path: P
): [get: V, set: SetStoreFunction<V>] => {
  const [getStore, setStore] = store;

  // Challenge #1: Evaluate path syntax the way `setStore` does for updating the store
  // https://github.com/solidjs/solid/blob/44a0fdeb585c4f5a3b9bccbf4b7d6c60c7db3ecd/packages/solid/store/src/store.ts#L509
  const get: V = getStore as unknown as V;

  // Challenge #2: Preserve type information for the path syntax of the derived setter
  const set: any = (...localPath: any) => {
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

const [arrayStore, setArrayStore] = createStore<{ a: number }[]>([]);
setArrayStore(0, "a", 1);

const [arrayLens, setArrayLens] = createLens([arrayStore, setArrayStore], 0);
setArrayLens("a", 4);

// TODO: handle arrays without exploding (???) ✅ constraint: allow only one filter function or range
// TODO: handle filter functions ✅
// TODO: composability ✅ returns an ordinary `SetStoreFunction`
// TODO: derive getter
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
