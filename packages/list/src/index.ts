import {
  createSignal,
  type Accessor,
  onCleanup,
  $TRACK,
  untrack,
  createRoot,
  createMemo,
  getOwner,
  runWithOwner,
  createOwner,
} from "solid-js";
import { type JSX } from "@solidjs/web";
import { isDev, INTERNAL_OPTIONS } from "@solid-primitives/utils";

/** Internal tracking record for a single live list element. */
type ListItem<T> = {
  /** Current array value this element represents. */
  value: T;
  /** Push a new value into the element's reactive signal without recreating it. */
  updateValue?: (v: T) => void;
  /** Push a new position into the element's reactive index signal. */
  updateIndex?: (i: number) => void;
  /** Last known position in the mapped array. */
  index: number;
  /** Dispose the reactive root that owns this element. */
  disposer: () => void;
};

/** Dispose every item in a slice and release their reactive roots. */
function disposeList(list: ListItem<any>[]) {
  for (let i = 0; i < list.length; i++) {
    list[i]?.disposer();
  }
}

/**
 * Reactively transforms an array, providing each mapped element with both a
 * reactive value accessor and a reactive index accessor.
 *
 * This is the primitive that backs `<List>`. Prefer `<List>` in JSX; use
 * `listArray` directly when you need a reactive array transformation outside
 * of a component — for example inside a store derivation or a custom hook.
 *
 * **Reconciliation strategy (in priority order):**
 * 1. Element stayed at the same index with the same value → no-op.
 * 2. Element moved to a new index (value matched elsewhere) → update `index()`.
 * 3. Element's value changed at its existing index slot → update `item()`.
 * 4. Neither value nor index matched → reuse an unused element, update both.
 * 5. No unused element available → create a new reactive root.
 * 6. Leftover unused elements → dispose.
 *
 * New elements are only created when the array grows beyond its previous
 * maximum length; elements are only disposed when the array shrinks.
 *
 * @param list     Accessor returning the source array (or falsy for empty).
 * @param mapFn    Called once per *new* element. Receives a stable reactive
 *                 `value` accessor and a stable reactive `index` accessor.
 *                 Both update in place rather than triggering a re-run of
 *                 `mapFn`.
 * @param options  Optional `fallback` accessor rendered when the list is empty.
 * @returns        A reactive accessor that returns the current array of mapped
 *                 values, in source order.
 *
 * @example
 * ```ts
 * const rows = listArray(items, (item, index) => ({
 *   label: () => `${index() + 1}. ${item().name}`,
 * }));
 * // rows() re-evaluates when items() changes; each row object is stable.
 * ```
 */
export function listArray<T, U>(
  list: Accessor<readonly T[] | undefined | null | false>,
  mapFn: (v: Accessor<T>, i: Accessor<number>) => U,
  options: { fallback?: Accessor<any> } = {},
): () => U[] {
  // Create a sibling owner rather than a child of the wrapping memo node.
  // Items rooted here survive memo recomputes because they sit beside the memo
  // in the ownership tree rather than beneath it — mirroring mapArray's
  // `data._owner` pattern.
  const listOwner = createOwner();

  const items: ListItem<T>[] = [];
  let mapped: U[] = [],
    unusedItems: number,
    i: number,
    j: number,
    item: ListItem<T>,
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
    // Keep listOwner's _parentComputed pointing at the current memo node so
    // that child-owner height calculations stay correct across re-runs.
    (listOwner as any)._parentComputed = getOwner();

    const newItems = list() || [];
    (newItems as any)[$TRACK]; // subscribe to the array's top-level identity

    return untrack(() => {
      // Clear the fallback as soon as real items arrive.
      if (newItems.length > 0 && fallbackDisposer) {
        fallbackDisposer();
        fallbackDisposer = undefined;
        fallback = undefined;
      }

      const temp: U[] = new Array(newItems.length);
      unusedItems = items.length;

      // Pass 1 — carry forward elements whose value AND index are unchanged.
      for (j = unusedItems - 1; j >= 0; --j) {
        item = items[j]!;
        oldIndex = item.index;
        if (oldIndex < newItems.length && newItems[oldIndex] === item.value) {
          temp[oldIndex] = mapped[oldIndex]!;
          // Compact the unused-item window by swapping the matched item to the
          // end so that passes 2-4 only iterate over truly unmatched items.
          if (--unusedItems !== j) {
            items[j] = items[unusedItems]!;
            items[unusedItems] = item;
          }
        }
      }

      // Build a value → [item indices] map over the remaining unmatched items
      // so that pass 2 can locate moves in O(1) per slot.
      const matcher = new Map<T, number[]>();
      const matchedItems = new Uint8Array(unusedItems);
      for (j = unusedItems - 1; j >= 0; --j) {
        const oldValue = items[j]!.value;
        matcher.get(oldValue)?.push(j) ?? matcher.set(oldValue, [j]);
      }

      // Pass 2 — element moved to a new position (value found, index changed).
      // Only the `index` signal needs updating; the element and its value are reused.
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        j = matcher.get(newValue)?.pop() ?? -1;
        if (j >= 0) {
          item = items[j]!;
          oldIndex = item.index;
          temp[i] = mapped[oldIndex]!;
          item.index = i;
          item.updateIndex?.(i);
          matchedItems[j] = 1;
        }
      }

      // Compact again — remove pass-2 matches from the unused-item window.
      for (j = matchedItems.length - 1; j >= 0; --j) {
        if (matchedItems[j] && --unusedItems !== j) {
          item = items[j]!;
          items[j] = items[unusedItems]!;
          items[unusedItems] = item;
        }
      }

      // Pass 3 — value changed at an index slot that is still free.
      // The element that previously occupied this slot is recycled in place;
      // only its `value` signal needs updating.
      for (j = unusedItems - 1; j >= 0; --j) {
        item = items[j]!;
        oldIndex = item.index;
        if (!(oldIndex in temp) && oldIndex < newItems.length) {
          temp[oldIndex] = mapped[oldIndex]!;
          newValue = newItems[oldIndex]!;
          item.value = newValue;
          item.updateValue?.(newValue);
          if (--unusedItems !== j) {
            items[j] = items[unusedItems]!;
            items[unusedItems] = item;
          }
        }
      }

      // Passes 4 & 5 — fill any remaining empty slots.
      for (i = 0; i < newItems.length; ++i) {
        if (i in temp) continue;
        newValue = newItems[i]!;
        if (unusedItems > 0) {
          // Pass 4: recycle an unused element — update both value and index signals.
          item = items[--unusedItems]!;
          temp[i] = mapped[item.index]!;
          changeBoth();
        } else {
          // Pass 5: no unused element available — create a brand-new reactive root
          // as a child of listOwner (sibling of the memo, not beneath it).
          temp[i] = runWithOwner(listOwner, () => createRoot(mapper))!;
        }
      }

      // Pass 6 — dispose any elements that had no matching slot in the new array.
      disposeList(items.splice(0, unusedItems));

      if (newItems.length === 0 && options.fallback) {
        mapped = temp;
        if (!fallbackDisposer) {
          fallback = [
            runWithOwner(listOwner, () =>
              createRoot(d => {
                fallbackDisposer = d;
                return options.fallback!();
              }),
            )!,
          ];
        }
        return fallback!;
      }
      return (mapped = temp);
    });
  };

  /** Update both signals on a recycled element (pass 4). Closes over `item`, `i`, `newValue`. */
  function changeBoth() {
    item.index = i;
    item.value = newValue;
    item.updateIndex?.(i);
    item.updateValue?.(newValue);
  }

  /**
   * Create a new `ListItem` with its own reactive value and index signals,
   * then call `mapFn` to produce the user's mapped value.
   *
   * Closes over the outer `newValue` and `i` variables, which hold the
   * correct values for the slot being filled at the time `createRoot` fires.
   *
   * The setter uses the function form `setV(() => v)` so that a value of type
   * `Function` is stored correctly rather than being invoked as an updater.
   */
  function mapper(disposer: () => void) {
    const [vV, setV] = isDev
      ? createSignal(newValue as Exclude<T, Function>, { name: "value", ownedWrite: true } as any)
      : createSignal(newValue as Exclude<T, Function>, INTERNAL_OPTIONS as any);
    const [vI, setI] = isDev
      ? createSignal(i, { name: "index", ownedWrite: true })
      : createSignal(i, INTERNAL_OPTIONS);

    const t: ListItem<T> = {
      value: newValue,
      index: i,
      disposer,
      updateValue: (v: T) => {
        t.value = v;
        setV(() => v as any);
      },
      updateIndex: (idx: number) => {
        t.index = idx;
        setI(idx);
      },
    };
    items.push(t);

    return mapFn(vV, vI);
  }
}

/**
 * A control-flow component that iterates over an array while providing each
 * item with **both** a reactive value accessor and a reactive index accessor.
 *
 * Unlike `<For>` (keyed by value) or `<Index>` (keyed by position), `<List>`
 * prioritizes value identity but also tracks position: when an item moves,
 * its `index()` updates reactively; when a value changes at a position, its
 * `item()` updates reactively. Elements are never recreated just because the
 * array was reordered or a value was swapped.
 *
 * @param props.each      The source array. Passing `undefined`, `null`, or
 *                        `false` is treated as an empty array.
 * @param props.fallback  Optional content rendered when `each` is empty or falsy.
 * @param props.children  Render function called once per *new* element.
 *                        Receives a stable `item` accessor and a stable `index`
 *                        accessor; both update in place without re-running the
 *                        render function.
 *
 * @example
 * ```tsx
 * <List each={items()} fallback={<p>No items</p>}>
 *   {(item, index) => (
 *     <div data-index={index()}>{item().name}</div>
 *   )}
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
        { name: "value" },
      )
    : createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
      )) as unknown as JSX.Element;
}
