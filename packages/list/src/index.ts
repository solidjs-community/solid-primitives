import {
  createSignal,
  type Accessor,
  type Setter,
  onCleanup,
  $TRACK,
  untrack,
  createRoot,
  batch,
  type JSX,
  createMemo,
} from "solid-js";
import {isDev} from "solid-js/web"

type ListItem<T> = {
  value: T;
  valueSetter?: Setter<T>;
  index: number;
  indexSetter?: Setter<number>;
  disposer: () => void;
};

function disposeList(list: ListItem<any>[]) {
  for (let i = 0; i < list.length; i++) {
    list[i]?.disposer();
  }
}

/**
 * Reactively transforms an array with a callback function - underlying helper for the `<List>` unkeyed control flow.
 *
 * Alternative to `mapArray` or `indexArray` that provides reactive value and index for array elements.
 */
export function listArray<T, U>(
  list: Accessor<readonly T[] | undefined | null | false>,
  mapFn: (v: Accessor<T>, i: Accessor<number>) => U,
  options: { fallback?: Accessor<any> } = {},
): () => U[] {
  const items: ListItem<T>[] = [];
  let mapped: U[] = [],
    unusedItems: number,
    i: number,
    j: number,
    item: ListItem<T>,
    oldValue: T,
    oldIndex: number,
    newValue: T,
    fallback: U[] | undefined,
    fallbackDisposer: undefined | (() => void);

  onCleanup(() => {
    fallbackDisposer?.();
    fallbackDisposer = undefined;
    disposeList(items);
  });
  return () => {
    const newItems = list() || [];
    (newItems as any)[$TRACK]; // top level tracking
    return untrack(() => {
      if (newItems.length > 0 && fallbackDisposer) {
        fallbackDisposer();
        fallbackDisposer = undefined;
        fallback = undefined;
      }

      const temp: U[] = new Array(newItems.length); // new mapped array
      unusedItems = items.length;

      // 1) no change when values & indexes match
      for (j = unusedItems - 1; j >= 0; --j) {
        item = items[j]!;
        oldIndex = item.index;
        if (oldIndex < newItems.length && newItems[oldIndex] === item.value) {
          temp[oldIndex] = mapped[oldIndex]!;
          if (--unusedItems !== j) {
            items[j] = items[unusedItems]!;
            items[unusedItems] = item;
          }
        }
      }

      // #2 prepare values matcher
      const matcher = new Map<T, number[]>();
      const matchedItems = new Uint8Array(unusedItems);
      for (j = unusedItems - 1; j >= 0; --j) {
        oldValue = items[j]!.value;
        matcher.get(oldValue)?.push(j) ?? matcher.set(oldValue, [j]);
      }

      // 2) change indexes when values match
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        j = matcher.get(newValue)?.pop() ?? -1;
        if (j >= 0) {
          item = items[j]!;
          oldIndex = item.index;
          temp[i] = mapped[oldIndex]!;
          item.index = i;
          item.indexSetter?.(i);
          matchedItems[j] = 1;
        }
      }

      // #2 reduce unusedItems for matched items
      for (j = matchedItems.length - 1; j >= 0; --j) {
        if (matchedItems[j] && --unusedItems !== j) {
          item = items[j]!;
          items[j] = items[unusedItems]!;
          items[unusedItems] = item;
        }
      }

      // 3) change values when indexes match
      for (j = unusedItems - 1; j >= 0; --j) {
        item = items[j]!;
        oldIndex = item.index;
        if (!(oldIndex in temp) && oldIndex < newItems.length) {
          temp[oldIndex] = mapped[oldIndex]!;
          newValue = newItems[oldIndex]!;
          item.value = newValue;
          item.valueSetter?.(newValueGetter);
          if (--unusedItems !== j) {
            items[j] = items[unusedItems]!;
            items[unusedItems] = item;
          }
        }
      }

      // 4) change value & index when none matched
      // 5) create new if no unused items left
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        if (unusedItems > 0) {
          item = items[--unusedItems]!;
          temp[i] = mapped[item.index]!;
          batch(changeBoth);
        } else {
          temp[i] = createRoot(mapper);
        }
      }

      // 6) delete any old unused items left
      disposeList(items.splice(0, unusedItems));

      if (newItems.length === 0 && options.fallback) {
        if (!fallbackDisposer) {
          fallback = [
            createRoot(d => {
              fallbackDisposer = d;
              return options.fallback!();
            }),
          ];
        }
        return fallback!;
      }
      return (mapped = temp);
    });
  };
  function newValueGetter() {
    return newValue;
  }
  function changeBoth() {
    item.index = i;
    item.indexSetter?.(i);
    item.value = newValue;
    item.valueSetter?.(newValueGetter);
  }
  function mapper(disposer: () => void) {
    const t: ListItem<T> = {
        value: newValue,
        index: i,
        disposer,
      },
      scopedV = newValue,
      scopedI = i;
    items.push(t);
    // signal created when used
    let sV: Accessor<T> = () => {
        [sV, t.valueSetter] = isDev
          ? createSignal(scopedV, { name: "value" })
          : createSignal(scopedV);
        return sV();
      },
      sI: Accessor<number> = () => {
        [sI, t.indexSetter] = isDev
          ? createSignal(scopedI, { name: "index" })
          : createSignal(scopedI);
        return sI();
      };

    return mapFn(
      () => sV(),
      () => sI(),
    );
  }
}

/**
 * Iteration over a list creating elements from its items.
 * It avoids recreating elements, instead reorders existing elements whenever possible and / or changes reactive value.
 *
 * To be used if you have a list with changing indexes and values.
 * ```typescript
 * <List each={items} fallback={<div>No items</div>}>
 *   {(item, index) => <div data-index={index()}>{item()}</div>}
 * </List>
 * ```
 */
export function List<T extends readonly any[], U extends JSX.Element>(props: {
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  children: (item: Accessor<T[number]>, index: Accessor<number>) => U;
}) {
  const fallback = "fallback" in props && { fallback: () => props.fallback };
  return (isDev
    ? createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
        undefined,
        { name: "value" },
      )
    : createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
      )) as unknown as JSX.Element;
}
