import type { Accessor, JSX } from "solid-js";
import { SetStoreFunction, StoreNode, unwrap } from "solid-js/store";
import type { EvaluatePath, StorePath } from "./types";

/**
 * Given a path within a Store object, return a derived or "focused" getter and setter.
 *
 * @param store A store getter and setter tuple, as returned by `createStore`
 * @param {...*} path a path array within the store, same as the parameters of `setStore`
 * @return A derived or "focused" Store, as a getter & setter tuple
 */
export const createLens = <T, P extends StorePath<T>, V extends EvaluatePath<T, P>>(
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

/**
 * Creates a derived Signal from a Store or object by using the same path syntax that
 * `SetStoreFunction` accepts.
 */
export function createFocusedGetter<T, P extends StorePath<T>, V extends EvaluatePath<T, P>>(
  store: T,
  ...path: P
): Accessor<V> {
  const unwrappedStore = unwrap((store || {}) as T);
  function getValue() {
    const value = getValueByPath(unwrappedStore as StoreNode, [...path]) as V;
    return value;
  }
  return getValue;
}

/**
 * Same algorithm as `updatePath` in `solid-js/store`, but does not modify
 * any values.
 */
export function getValueByPath(
  current: StoreNode,
  path: any[],
  traversed: PropertyKey[] = [],
): any {
  if (path.length === 0) return current;

  // RE `path.shift()`: Beware that this has a side effect that mutates the
  // array that is passed in! This doesn't affect anything in `updatePath` from
  // `solid-store` because a new array is passed in every time. However, in the
  // case of `createFocusedGetter`, the same path argument is re-used every
  // time. That means it should be cloned before being passed to
  // `getValueByPath`.
  const part = path.shift(),
    partType = typeof part,
    isArray = Array.isArray(current);

  if (Array.isArray(part)) {
    // Ex. update('data', [2, 23], 'label', l => l + ' !!!');
    const value: any[] = [];
    for (let i = 0; i < part.length; i++) {
      value.push(getValueByPath(current, [part[i]].concat(path), traversed));
    }
    return value;
  } else if (isArray && partType === "function") {
    // Ex. update('data', i => i.id === 42, 'label', l => l + ' !!!');
    const value: any[] = [];
    for (let i = 0; i < current.length; i++) {
      if (part(current[i], i)) value.push(getValueByPath(current, [i].concat(path), traversed));
    }
    return value;
  } else if (isArray && partType === "object") {
    // Ex. update('data', { from: 3, to: 12, by: 2 }, 'label', l => l + ' !!!');
    const { from = 0, to = current.length - 1, by = 1 } = part;
    const value: any[] = [];
    for (let i = from; i <= to; i += by) {
      value.push(getValueByPath(current, [i].concat(path), traversed));
    }
    return value;
  } else {
    return getValueByPath(current[part], path, [part].concat(traversed));
  }
}

// ...

// While making primitives, there are many patterns in our arsenal
// There are functions like one above, but we also can use components, directives, element properties, etc.
// Solid's tutorial on directives: https://www.solidjs.com/tutorial/bindings_directives
// Example package that uses directives: https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer
// Example use of components: https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/src/components.ts

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
