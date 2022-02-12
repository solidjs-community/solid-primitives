import {
  Accessor,
  createMemo,
  createRoot,
  createSignal,
  JSX,
  on,
  onCleanup,
  Setter
} from "solid-js";

const FALLBACK = Symbol("fallback");

export function mapKey<T, U, K>(
  list: Accessor<readonly T[] | undefined | null | false>,
  keyFn: (v: T) => K,
  mapFn: (v: Accessor<T>, i: Accessor<number>) => U,
  options: { fallback?: Accessor<U> } = {}
): Accessor<U[]> {
  type Save = { setItem: Setter<T>; setIndex?: Setter<number>; mapped: U; dispose: () => void };

  const prev = new Map<K | typeof FALLBACK, Save>();
  onCleanup(() => prev.forEach(v => v.dispose()));

  return createMemo<U[]>(
    on(list, _list => {
      const list = _list || [];

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

      // fast path for new create
      if (!prev.size) {
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

        const fb = prev.get(FALLBACK);
        if (fb) {
          fb.dispose();
          prev.delete(FALLBACK);
        } else {
          prevKeys.forEach(key => {
            prev.get(key)?.dispose();
            prev.delete(key);
          });
        }
      }

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

export function Key<T, U extends JSX.Element>(props: {
  each?: readonly T[] | null | false;
  by: (v: T) => any;
  fallback?: U;
  children: (v: Accessor<T>, i: Accessor<number>) => U;
}): Accessor<U[]> {
  const fallback = props.fallback ? () => props.fallback as U : undefined;
  const mapped = mapKey<T, U, any>(() => props.each, props.by, props.children, { fallback });
  return createMemo(mapped);
}
