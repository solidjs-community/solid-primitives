import {
  Accessor,
  createMemo,
  createRoot,
  createSignal,
  JSX,
  on,
  onCleanup,
  Setter,
  Component
} from "solid-js";

const FALLBACK = Symbol("fallback");

/**
 * Reactively maps an array by specified key with a callback function - underlying helper for the `<Key>` control flow.
 * @param list input list of values to map
 * @param keyFn key getter, items will be identified by it's value. changing the value is changing the item.
 * @param mapFn reactive function used to create mapped output item. Similar to `Array.prototype.map` but both item and index are signals, that could change over time.
 * @param options a fallback for when the input list is empty or missing
 * @returns mapped input array signal
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/keyed#mapKey
 */
export function mapKey<T, U, K>(
  list: Accessor<readonly T[] | undefined | null | false>,
  keyFn: (v: T) => K,
  mapFn: (v: Accessor<T>, i: Accessor<number>) => U,
  options: { fallback?: Accessor<U> } = {}
): Accessor<U[]> {
  type Save = { setItem: Setter<T>; setIndex?: Setter<number>; mapped: U; dispose: () => void };

  const prev = new Map<K | typeof FALLBACK, Save>();
  onCleanup(() => prev.forEach(v => v.dispose()));

  const empty: readonly T[] = [];
  const items = createMemo(on(list, list => (list && list.length ? list : empty)));

  return createMemo<U[]>(
    on(items, list => {
      // fast path for empty arrays
      if (!list.length) {
        prev.forEach(v => v.dispose());
        prev.clear();
        if (!options.fallback) return [];
        const fb = createRoot(dispose => {
          prev.set(FALLBACK, { dispose } as Save);
          return options.fallback!();
        });
        return [fb];
      }

      const result = new Array<U>(list.length);

      // fast path for new create or after fallback
      const fb = prev.get(FALLBACK);
      if (!prev.size || fb) {
        fb?.dispose();
        prev.delete(FALLBACK);
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const key = keyFn(item);
          addNewItem(result, item, i, key);
        }
        return result;
      }

      const prevKeys = new Set(prev.keys());

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const key = keyFn(item);
        prevKeys.delete(key);
        const lookup = prev.get(key);

        if (lookup) {
          result[i] = lookup.mapped;
          lookup.setIndex?.(i);
          lookup.setItem(() => item);
        } else addNewItem(result, item, i, key);
      }

      prevKeys.forEach(key => {
        prev.get(key)?.dispose();
        prev.delete(key);
      });

      return result;
    })
  );

  function addNewItem(list: U[], item: T, i: number, key: K): void {
    createRoot(dispose => {
      const [getItem, setItem] = createSignal(item);
      const save = { setItem, dispose } as Save;
      if (mapFn.length > 1) {
        const [index, setIndex] = createSignal(i);
        save.setIndex = setIndex;
        save.mapped = mapFn(getItem, index);
      } else save.mapped = (mapFn as any)(getItem);
      prev.set(key, save);
      list[i] = save.mapped;
    });
  }
}

/**
 * creates a list of elements from the input `each` list
 *
 * it receives a map function as its child that receives a **list item signal** and **index signal** and returns a JSX-Element; if the list is empty, an optional fallback is returned:
 * ```tsx
 * <Key each={items()} by={item => item.id} fallback={<div>No items</div>}>
 *   {(item, index) => <div data-index={index()}>{item()}</div>}
 * </Key>
 * ```
 *
 * prop `by` can also be an object key:
 * ```tsx
 * <Key each={items()} by="id">
 * ```
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/keyed#Key
 */
export function Key<T, U extends JSX.Element>(props: {
  each?: readonly T[] | null | false;
  by: ((v: T) => any) | keyof T;
  fallback?: U;
  children: (v: Accessor<T>, i: Accessor<number>) => U;
}): Accessor<U[]> {
  const fallback = props.fallback ? () => props.fallback as U : undefined;
  const { by } = props;
  const key = typeof by === "function" ? by : (v: T) => v[by];
  const mapped = mapKey<T, U, any>(() => props.each, key, props.children, { fallback });
  return createMemo(mapped);
}

/**
 * Causes the children to rerender when the `on` changes.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#Rerun
 */
export const Rerun: Component<{ on: any }> = props => {
  const key = createMemo(() => props.on);
  return createMemo(() => {
    key();
    return props.children;
  });
};
