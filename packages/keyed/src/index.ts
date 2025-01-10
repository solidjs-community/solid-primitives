import {
  Accessor,
  createMemo,
  createRoot,
  createSignal,
  JSX,
  on,
  onCleanup,
  Setter,
  untrack,
  $TRACK,
  mapArray,
  AccessorArray,
} from "solid-js";
import { isServer } from "solid-js/web";

const FALLBACK = Symbol("fallback");

function dispose(list: Iterable<{ dispose: VoidFunction }>) {
  for (const o of list) o.dispose();
}

/**
 * Reactively maps an array by specified key with a callback function - underlying helper for the `<Key>` control flow.
 * @param list input list of values to map
 * @param keyFn key getter, items will be identified by it's value. changing the value is changing the item.
 * @param mapFn reactive function used to create mapped output item. Similar to `Array.prototype.map` but both item and index are signals, that could change over time.
 * @param options a fallback for when the input list is empty or missing
 * @returns mapped input array signal
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyed#keyArray
 */
export function keyArray<T, U, K>(
  items: Accessor<readonly T[] | undefined | null | false>,
  keyFn: (item: T, index: number) => K,
  mapFn: (v: Accessor<T>, i: Accessor<number>) => U,
  options: { fallback?: Accessor<U> } = {},
): Accessor<U[]> {
  // SERVER NOOP
  if (isServer) {
    const itemsRef = items();
    let s: U[] = [];
    if (itemsRef && itemsRef.length) {
      for (let i = 0, len = itemsRef.length; i < len; i++)
        s.push(
          mapFn(
            () => itemsRef[i]!,
            () => i,
          ),
        );
    } else if (options.fallback) s = [options.fallback()];
    return () => s;
  }

  type Save = { setItem: Setter<T>; setIndex?: Setter<number>; mapped: U; dispose: () => void };

  const prev = new Map<K | typeof FALLBACK, Save>();
  onCleanup(() => dispose(prev.values()));

  return () => {
    const list = items() || [];
    (list as any)[$TRACK]; // top level store tracking

    return untrack(() => {
      // fast path for empty arrays
      if (!list.length) {
        dispose(prev.values());
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
          const item = list[i]!;
          const key = keyFn(item, i);
          addNewItem(result, item, i, key);
        }
        return result;
      }

      const prevKeys = new Set(prev.keys());

      for (let i = 0; i < list.length; i++) {
        const item = list[i]!;
        const key = keyFn(item, i);
        prevKeys.delete(key);
        const lookup = prev.get(key);

        if (lookup) {
          result[i] = lookup.mapped;
          lookup.setIndex?.(i);
          lookup.setItem(() => item);
        } else addNewItem(result, item, i, key);
      }

      for (const key of prevKeys) {
        prev.get(key)?.dispose();
        prev.delete(key);
      }

      return result;
    });
  };

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
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyed#Key
 */
export function Key<T>(props: {
  each?: readonly T[] | null | false;
  by: ((v: T) => any) | keyof T;
  fallback?: JSX.Element;
  children: (v: Accessor<T>, i: Accessor<number>) => JSX.Element;
}): JSX.Element {
  const { by } = props;
  return createMemo(
    keyArray<T, JSX.Element, any>(
      () => props.each,
      typeof by === "function" ? by : (v: T) => v[by],
      props.children,
      "fallback" in props ? { fallback: () => props.fallback } : undefined,
    ),
  ) as unknown as JSX.Element;
}

/**
 * creates a list of elements from the entries of provided object
 *
 * @param props
 * @param props.of object to iterate entries of (`Object.entries(object)`)
 * @param props.children
 * a map render function that receives an object key, **value signal** and **index signal** and returns a JSX-Element; if the list is empty, an optional fallback is returned:
 * ```tsx
 * <Entries of={object()} fallback={<div>No items</div>}>
 *   {(key, value, index) => <div data-index={index()}>{key}: {value()}</div>}
 * </Entries>
 * ```
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyed#Entries
 */
export function Entries<K extends string | number, V>(props: {
  of: Record<K, V> | ArrayLike<V> | undefined | null | false;
  fallback?: JSX.Element;
  children: (
    key: K extends number ? string : K,
    v: Accessor<V>,
    i: Accessor<number>,
  ) => JSX.Element;
}): JSX.Element {
  // changes to this function may be applicable to similar functions - grep 4A29BECD-767A-4CC0-AEBB-3543D7B444C6
  const mapFn = props.children;
  return createMemo(
    mapArray(
      () => props.of && Object.keys(props.of),
      mapFn.length < 3
        ? key =>
            (mapFn as (key: string, v: Accessor<V>) => JSX.Element)(
              key,
              () => props.of![key as never],
            )
        : (key, i) => mapFn(key as never, () => props.of![key as never], i),
      "fallback" in props ? { fallback: () => props.fallback } : undefined,
    ),
  ) as unknown as JSX.Element;
}

/**
 * Creates a list of elements from the entries of provided Map
 *
 * @param props
 * @param props.of map to iterate entries of (`myMap.entries()`)
 * @param props.children
 * a map render function that receives a Map key, **value signal** and **index signal** and returns a JSX-Element; if the list is empty, an optional fallback is returned:
 * ```tsx
 * <MapEntries of={map()} fallback={<div>No items</div>}>
 *   {(key, value, index) => <div data-index={index()}>{key}: {value()}</div>}
 * </MapEntries>
 * ```
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyed#mapentries
 */
export function MapEntries<K, V>(props: {
  of: Map<K, V> | undefined | null | false;
  fallback?: JSX.Element;
  children: (key: K, v: Accessor<V>, i: Accessor<number>) => JSX.Element;
}): JSX.Element {
  // changes to this function may be applicable to similar functions - grep 4A29BECD-767A-4CC0-AEBB-3543D7B444C6
  const mapFn = props.children;
  return createMemo(
    mapArray(
      () => props.of && Array.from(props.of.keys()),
      mapFn.length < 3
        ? key =>
            (mapFn as (key: K, v: Accessor<V>) => JSX.Element)(
              key,
              () => (props.of as Map<K, V>).get(key)!,
            )
        : (key, i) => mapFn(key, () => (props.of as Map<K, V>).get(key)!, i),
      "fallback" in props ? { fallback: () => props.fallback } : undefined,
    ),
  ) as unknown as JSX.Element;
}

/**
 * Creates a list of elements from the values of provided Set
 *
 * @param props
 * @param props.of set to iterate values of (`mySet.values()`)
 * @param props.children
 * a map render function that receives a Set value and **index signal** and returns a JSX-Element; if the list is empty, an optional fallback is returned:
 * ```tsx
 * <SetValues of={set()} fallback={<div>No items</div>}>
 *   {(value, index) => <div data-index={index()}>{value)}</div>}
 * </SetValues>
 * ```
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyed#setvalues
 */
export function SetValues<T>(props: {
  of: Set<T> | undefined | null | false;
  fallback?: JSX.Element;
  children: (value: T, i: Accessor<number>) => JSX.Element;
}): JSX.Element {
  // changes to this function may be applicable to similar functions - grep 4A29BECD-767A-4CC0-AEBB-3543D7B444C6
  const mapFn = props.children;
  return createMemo(
    mapArray(
      () => props.of && Array.from(props.of.values()),
      mapFn.length < 2 ? value => (mapFn as (value: T) => JSX.Element)(value) : mapFn,
      "fallback" in props ? { fallback: () => props.fallback } : undefined,
    ),
  ) as unknown as JSX.Element;
}

export type RerunChildren<T> = ((input: T, prevInput: T | undefined) => JSX.Element) | JSX.Element;

/**
 * Causes the children to rerender when the `on` changes.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/refs#Rerun
 */
export function Rerun<S>(props: {
  on: AccessorArray<S> | Accessor<S>;
  children: RerunChildren<S>;
}): JSX.Element;
export function Rerun<
  S extends (object | string | bigint | number | boolean) & { length?: never },
>(props: { on: S; children: RerunChildren<S> }): JSX.Element;
export function Rerun(props: { on: any; children: RerunChildren<any> }): JSX.Element {
  const key = typeof props.on === "function" || Array.isArray(props.on) ? props.on : () => props.on;
  return createMemo(
    on(key, (a, b) => {
      const child = props.children;
      return typeof child === "function" && child.length > 0 ? (child as any)(a, b) : child;
    }),
  ) as unknown as JSX.Element;
}
