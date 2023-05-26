import { JSX } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

/**
 * A template example of how to create a new primitive.
 *
 * @param store A store getter and setter tuple, as returned by `createStore`
 * @param {...*} args a path within the store, same as the parameters of `setStore`
 * @return A derived or "focused" Store setter
 */
export const createLens = <T>(
  store: [get: T, set: SetStoreFunction<T>],
  ...path: Parameters<SetStoreFunction<T>>
): [get: any, set: SetStoreFunction<any>] => {
  const [getStore, setStore] = store;

  // Challenge #1: Evaluate path syntax the way `setStore` does for updating the store
  // https://github.com/solidjs/solid/blob/44a0fdeb585c4f5a3b9bccbf4b7d6c60c7db3ecd/packages/solid/store/src/store.ts#L509
  const get: any = getStore;

  // Challenge #2: Preserve type information for the path syntax of the derived setter
  const set: SetStoreFunction<T> = (...localPath: any[]) =>
    setStore(...([...path, ...localPath] as Parameters<SetStoreFunction<T>>));

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
