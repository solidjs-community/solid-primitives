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

// Property indexes of `ListItem`
const VALUE = 0,
  VALUE_SETTER = 1,
  INDEX = 2,
  INDEX_SETTER = 3,
  DISPOSER = 4;
type ListItem<T> = [T, Setter<T> | undefined, number, Setter<number> | undefined, () => void];

function disposeList(list: ListItem<any>[]) {
  for (let i = 0; i < list.length; i++) {
    list[i]?.[DISPOSER]();
  }
}

/**
 * Reactively transforms an array with a callback function - underlying helper for the `<List>` control flow.
 *
 * Alternative to `mapArray` or `indexArray` that provides reactive value and index for array elements.
 *
 */
export function listArray<T, U>(
  list: Accessor<readonly T[] | undefined | null | false>,
  mapFn: (v: Accessor<T>, i: Accessor<number>) => U,
  options: { fallback?: Accessor<any> } = {},
): () => U[] {
  let mapped: U[] = [],
    items: ListItem<T>[] = [],
    searchTo: number,
    swap: ListItem<T>,
    i: number,
    j: number,
    item: ListItem<T>,
    oldValue: T,
    oldIndex: number,
    newValue: T,
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
      }

      const temp: U[] = new Array(newItems.length);

      // fast path for empty arrays
      if (newItems.length === 0) {
        if (items.length !== 0) {
          disposeList(items);
          items = [];
          mapped = [];
        }
        if (options.fallback) {
        }

        return (mapped = temp);
      }

      searchTo = items.length;

      // no change when values & indexes match
      for (i = 0; i < newItems.length; ++i) {
        newValue = newItems[i]!;
        for (j = searchTo - 1; j >= 0; --j) {
          item = items[j]!;
          oldValue = item[VALUE];
          oldIndex = item[INDEX];
          if (newValue === oldValue && oldIndex === i) {
            temp[i] = mapped[i]!;
            if (--searchTo !== j) {
              swap = items[searchTo]!;
              items[searchTo] = item;
              items[j] = swap;
            }
            break;
          }
        }
      }

      // change indexes when values match
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        for (j = searchTo - 1; j >= 0; --j) {
          item = items[j]!;
          oldValue = item[VALUE];
          if (newValue === oldValue) {
            oldIndex = item[INDEX];

            temp[i] = mapped[oldIndex]!;
            item[INDEX] = i;
            item[INDEX_SETTER]?.(i);

            if (--searchTo !== j) {
              swap = items[searchTo]!;
              items[searchTo] = item;
              items[j] = swap;
            }
            break;
          }
        }
      }

      // change values when indexes match
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        for (j = searchTo - 1; j >= 0; --j) {
          item = items[j]!;
          if (item[INDEX] === i) {
            temp[i] = mapped[i]!;
            item[VALUE] = newValue;
            item[VALUE_SETTER]?.(newValueGetter);

            if (--searchTo !== j) {
              swap = items[searchTo]!;
              items[searchTo] = item;
              items[j] = swap;
            }
            break;
          }
        }
      }

      // change value & index when none matched, create new if no unused old items left
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        if (searchTo > 0) {
          item = items[--searchTo]!;
          temp[i] = mapped[item[INDEX]]!;
          batch(changeBoth);
        } else {
          temp[i] = createRoot(mapper);
        }
      }

      // delete any old unused items left
      disposeList(items.splice(0, searchTo));

      if (newItems.length === 0 && options.fallback) {
        return [
          createRoot(d => {
            fallbackDisposer = d;
            return options.fallback!();
          }),
        ];
      }

      return (mapped = temp);
    });
  };
  function newValueGetter() {
    return newValue;
  }
  function changeBoth() {
    item[INDEX] = i;
    item[INDEX_SETTER]?.(i);
    item[VALUE] = newValue;
    item[VALUE_SETTER]?.(newValueGetter);
  }
  function mapper(disposer: () => void) {
    const [sv, setV] = "_SOLID_DEV_"
      ? createSignal(newValue, { name: "value" })
      : createSignal(newValue);
    const [si, setI] = "_SOLID_DEV_" ? createSignal(i, { name: "index" }) : createSignal(i);
    items.push([newValue, setV, i, setI, disposer]);
    return mapFn(sv, si);
  }
}

/**
 * Iteration over a list creating elements from its items.
 * It avoids recreating elements, instead reorders existing and / or changes value whenever possible.
 *
 * To be used if you have a list with changing indexes and values.
 * ```typescript
 * <List each={items} fallback={<div>No items</div>}>
 *   {(item, index) => <div data-index={index()}>{item()}</div>}
 * </List>
 * ```
 * If you have a list with changing indices, better use `<For>`.
 *
 */
export function List<T extends readonly any[], U extends JSX.Element>(props: {
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  children: (item: Accessor<T[number]>, index: Accessor<number>) => U;
}) {
  const fallback = "fallback" in props && { fallback: () => props.fallback };
  return ("_SOLID_DEV_"
    ? createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
        undefined,
        { name: "value" },
      )
    : createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
      )) as unknown as JSX.Element;
}
