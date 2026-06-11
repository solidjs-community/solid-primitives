import {
  $TRACK,
  createMemo,
  createOwner,
  createSignal,
  runWithOwner,
  type Accessor,
  type Signal,
  type Element,
} from "solid-js";
import { isDev } from "@solid-primitives/utils";

export type Maybe<T> = T | void | null | undefined | false;

type Root = ReturnType<typeof createOwner>;

type ListOptions<T> = {
  keyed?: boolean | ((item: T) => any);
  fallback?: Accessor<Element>;
  name?: string;
  recycle?: boolean;
};

/**
 * A control-flow component that iterates over an array while providing each
 * item with a reactive value accessor, a reactive index accessor or both.
 * Extension of `<For>` with additional `recycle` option.
 *
 * `<List recycle>` prioritizes value identity but also tracks position:
 * when an item moves, its `index()` updates reactively;
 * when a value changes at a position, its `item()` updates reactively.
 * Elements are never recreated just because the array was reordered or
 * a value was swapped.
 *
 * @param props.each      The source array. Passing `undefined`, `null`, or
 *                        `false` is treated as an empty array.
 * @param props.fallback  Optional content rendered when `each` is empty or falsy.
 * @param props.children  Render function called once per *new* element.
 *                        Receives a stable `item` accessor, a stable `index`
 *                        accessor or both; both update in place without re-running
 *                        the render function.
 * @param props.keyed     Optional custom function to match elements or `false` for
 *                        unkeyed flow.
 * @param props.recycle   Optional boolean to enable recycling behavior.
 *
 * @example
 * ```tsx
 * <List recycle each={items()} fallback={<p>No items</p>}>
 *   {(item, index) => (
 *     <div data-index={index()}>{item().name}</div>
 *   )}
 * </List>
 * ```
 */
export function List<T extends readonly any[], U extends Element>(props: {
  each: T | undefined | null | false;
  fallback?: Element;
  keyed?: true;
  recycle?: false;
  children: (item: T[number], index: Accessor<number>) => U;
}): Element;
export function List<T extends readonly any[], U extends Element>(props: {
  each: T | undefined | null | false;
  fallback?: Element;
  keyed?: true;
  recycle: true;
  children: (item: Accessor<T[number]>, index: Accessor<number>) => U;
}): Element;
export function List<T extends readonly any[], U extends Element>(props: {
  each: T | undefined | null | false;
  fallback?: Element;
  keyed: false;
  recycle?: boolean;
  children: (item: Accessor<T[number]>, index: number) => U;
}): Element;
export function List<T extends readonly any[], U extends Element>(props: {
  each: T | undefined | null | false;
  fallback?: Element;
  keyed: (item: T[number]) => any;
  recycle?: boolean;
  children: (item: Accessor<T[number]>, index: Accessor<number>) => U;
}): Element;
export function List<T extends readonly any[], U extends Element>(props: {
  each: T | undefined | null | false;
  fallback?: Element;
  keyed?: boolean | ((item: T[number]) => any);
  recycle?: boolean;
  children: (item: any, index: any) => U;
}): Element {
  const options: ListOptions<T[number]> =
    "fallback" in props
      ? { keyed: props.keyed, recycle: props.recycle, fallback: () => props.fallback }
      : { keyed: props.keyed, recycle: props.recycle };
  if (isDev) options.name = "<List>";
  return listArray(() => props.each, props.children as any, options as any) as unknown as Element;
}

/**
 * Reactively transforms an array, providing each mapped element with a
 * reactive value accessor, a reactive index accessor or both. Extension
 * of `mapArray` with additional `recycle` option.
 *
 * This is the primitive that backs `<List>`. Prefer `<List>` in JSX; use
 * `listArray` directly when you need a reactive array transformation outside
 * of a component — for example inside a store derivation or a custom hook.
 *
 * **Recycle reconciliation strategy (in priority order):**
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
 *                 `value` accessor and a stable reactive `index` accessor,
 *                 depending on options. Both update in place rather than
 *                 triggering a re-run of `mapFn`.
 * @param options  Optional `fallback` accessor rendered when the list is empty.
 *                 Optional `keyed` - a custom function to match elements or
 *                 `false` for unkeyed flow. Optional `recycle` boolean to enable
 *                 recycling behavior.
 * @param recycle  Enables recycling behavior when set to `true`.
 * @returns        A reactive accessor that returns the current array of mapped
 *                 values, in source order.
 *
 * @example
 * ```ts
 * const rows = listArray(
 *   items,
 *   (item, index) => ({
 *     label: () => `${index() + 1}. ${item().name}`,
 *   }),
 *   { recycle: true }
 * );
 * // rows() re-evaluates when items() changes; each row object is stable.
 * ```
 */
export function listArray<Item, MappedItem>(
  list: Accessor<Maybe<readonly Item[]>>,
  map: (value: Item, index: Accessor<number>) => MappedItem,
  options?: { keyed?: true; recycle?: false; fallback?: Accessor<any>; name?: string },
): Accessor<MappedItem[]>;
export function listArray<Item, MappedItem>(
  list: Accessor<Maybe<readonly Item[]>>,
  map: (value: Accessor<Item>, index: Accessor<number>) => MappedItem,
  options?: { keyed?: true; recycle: true; fallback?: Accessor<any>; name?: string },
): Accessor<MappedItem[]>;
export function listArray<Item, MappedItem>(
  list: Accessor<Maybe<readonly Item[]>>,
  map: (value: Accessor<Item>, index: number) => MappedItem,
  options: { keyed: false; recycle?: boolean; fallback?: Accessor<any>; name?: string },
): Accessor<MappedItem[]>;
export function listArray<Item, MappedItem>(
  list: Accessor<Maybe<readonly Item[]>>,
  map: (value: Accessor<Item>, index: Accessor<number>) => MappedItem,
  options: {
    keyed: (item: Item) => any;
    recycle?: boolean;
    fallback?: Accessor<any>;
    name?: string;
  },
): Accessor<MappedItem[]>;
export function listArray<Item, MappedItem>(
  list: Accessor<Maybe<readonly Item[]>>,
  map:
    | ((value: Item, index: Accessor<number>) => MappedItem)
    | ((value: Accessor<Item>, index: number) => MappedItem)
    | ((value: Accessor<Item>, index: Accessor<number>) => MappedItem),
  options?: {
    keyed?: boolean | ((item: Item) => any);
    recycle?: boolean;
    fallback?: Accessor<any>;
    name?: string;
  },
): Accessor<MappedItem[]> {
  const keyFn = typeof options?.keyed === "function" ? options.keyed : undefined;
  const indexes = map.length > 1;
  const data: MapData<Item, MappedItem> = {
    _owner: createOwner(),
    _len: 0,
    _list: list,
    _items: [],
    _map: map,
    _mappings: [],
    _nodes: [],
    _key: keyFn,
    _rows: keyFn || options?.keyed === false || options?.recycle === true ? [] : undefined,
    _indexes: indexes && options?.keyed !== false ? [] : undefined,
    _unkeyed: options?.keyed === false,
    _recycle: options?.recycle,
    _fallback: options?.fallback,
  };
  const node = createMemo(updateKeyedMap.bind(data as MapData<unknown, unknown>));
  return () => node();
}

const pureOptions = { ownedWrite: true };
function updateKeyedMap<Item, MappedItem>(this: MapData<Item, MappedItem>): any[] {
  const newItems = this._list() || [],
    newLen = newItems.length;
  (newItems as any)[$TRACK]; // top level tracking

  runWithOwner(this._owner, () => {
    let i: number | undefined,
      j: number | undefined,
      mapper = this._rows
        ? this._unkeyed
          ? () => {
              this._rows![j!] = createSignal<Item>(() => newItems[j!]!, pureOptions);
              return this._map(this._rows![j!]![0], j);
            }
          : () => {
              this._rows![j!] = createSignal<Item>(() => newItems[j!]!, pureOptions);
              this._indexes && (this._indexes[j!] = createSignal(j!, pureOptions));
              return this._map(
                this._rows![j!]![0],
                this._indexes ? this._indexes[j!]![0] : (undefined as any),
              );
            }
        : this._indexes
          ? () => {
              const item = newItems[j!];
              this._indexes![j!] = createSignal(j!, pureOptions);
              return this._map(item, this._indexes![j!]![0]);
            }
          : () => {
              const item = newItems[j!]!;
              return (this._map as (value: Item) => MappedItem)(item);
            };

    // fast path for empty arrays
    if (newLen === 0) {
      if (this._len !== 0) {
        this._owner.dispose(false);
        this._nodes = [];
        this._items = [];
        this._mappings = [];
        this._len = 0;
        this._rows && (this._rows = []);
        this._indexes && (this._indexes = []);
      }
      if (this._fallback && !this._mappings[0]) {
        // create fallback
        this._mappings[0] = runWithOwner<MappedItem>(
          (this._nodes[0] = createOwner()),
          this._fallback,
        );
      }
    }
    // fast path for new create
    else if (this._len === 0) {
      // dispose previous fallback
      if (this._nodes[0]) this._nodes[0].dispose();
      this._mappings = new Array(newLen);

      for (j = 0; j < newLen; j++) {
        this._items[j] = newItems[j]!;
        this._mappings[j] = runWithOwner<MappedItem>((this._nodes[j] = createOwner()), mapper);
      }

      this._len = newLen;
    } else {
      let start: number,
        end: number,
        newEnd: number,
        item: Item,
        key: any,
        newIndices: Map<Item, number>,
        newIndicesNext: number[],
        temp: MappedItem[] = new Array(newLen),
        tempNodes: Root[] = new Array(newLen),
        tempRows: Signal<Item>[] | undefined = this._rows ? new Array(newLen) : undefined,
        tempIndexes: Signal<number>[] | undefined = this._indexes ? new Array(newLen) : undefined,
        unusedIndexes: number[] | undefined = this._recycle && !this._unkeyed ? [] : undefined; // unkeyed uses every element, no need to reuse

      // skip common prefix
      for (
        start = 0, end = Math.min(this._len, newLen);
        start < end &&
        (this._items[start] === newItems[start] ||
          (this._rows &&
            this._key !== undefined &&
            compare(this._key, this._items[start], newItems[start])));
        start++
      ) {
        if (this._rows) this._rows[start]![1](() => newItems[start]!);
      }

      // common suffix
      for (
        end = this._len - 1, newEnd = newLen - 1;
        end >= start &&
        newEnd >= start &&
        (this._items[end] === newItems[newEnd] ||
          (this._rows &&
            this._key !== undefined &&
            compare(this._key, this._items[end], newItems[newEnd])));
        end--, newEnd--
      ) {
        temp[newEnd] = this._mappings[end]!;
        tempNodes[newEnd] = this._nodes[end]!;
        tempRows && (tempRows[newEnd] = this._rows![end]!);
        tempIndexes && (tempIndexes[newEnd] = this._indexes![end]!);
      }

      // 0) prepare a map of all indices in newItems, scanning backwards so we encounter them in natural order
      newIndices = new Map<Item, number>();
      newIndicesNext = new Array(newEnd + 1);
      for (j = newEnd; j >= start; j--) {
        item = newItems[j]!;
        key = this._key ? this._key(item) : item;
        i = newIndices.get(key);
        newIndicesNext[j] = i === undefined ? -1 : i;
        newIndices.set(key, j);
      }

      // 1) step through all old items and see if they can be found in the new set; if so, save them in a temp array and mark them moved; if not, mark as unused or dispose
      for (i = start; i <= end; i++) {
        item = this._items[i]!;
        key = this._key ? this._key(item) : item;
        j = newIndices.get(key);
        if (j !== undefined && j !== -1) {
          temp[j] = this._mappings[i]!;
          tempNodes[j] = this._nodes[i]!;
          tempRows && (tempRows[j] = this._rows![i]!);
          tempIndexes && (tempIndexes[j] = this._indexes![i]!);
          j = newIndicesNext[j]!;
          newIndices.set(key, j);
        } else if (unusedIndexes) {
          unusedIndexes.push(i);
        } else {
          this._nodes[i]!.dispose();
        }
      }

      // step for recycling
      if (unusedIndexes) {
        const indexUnmatched: number[] = [];
        for (const index of unusedIndexes) {
          if (index >= temp.length || index in temp) {
            // for changing both index and value or disposing
            indexUnmatched.push(index);
          } else {
            // changing only value (same index)
            temp[index] = this._mappings[index]!;
            tempNodes[index] = this._nodes[index]!;
            tempRows && (tempRows[index] = this._rows![index]!);
            tempIndexes && (tempIndexes[index] = this._indexes![index]!);
          }
        }
        i = 0; // for indexUnmatched iteration
        for (j = start; j < newLen && i < indexUnmatched.length; j++) {
          if (j in temp) continue;

          // change both index and value
          const index = indexUnmatched[i]!;

          temp[j] = this._mappings[index]!;
          tempNodes[j] = this._nodes[index]!;
          tempRows && (tempRows[j] = this._rows![index]!);
          tempIndexes && (tempIndexes[j] = this._indexes![index]!);
          i++;
        }
        // continue iterating indexUnmatched to dispose
        for (; i < indexUnmatched.length; i++) {
          this._nodes[indexUnmatched[i]!]!.dispose();
        }
      }

      // 2) set all the new values, pulling from the temp array if copied, otherwise entering the new value
      for (j = start; j < newLen; j++) {
        if (j in temp) {
          this._mappings[j] = temp[j]!;
          this._nodes[j] = tempNodes[j]!;
          if (tempRows) {
            this._rows![j] = tempRows[j]!;
            this._rows![j]![1](() => newItems[j!]!);
          }
          if (tempIndexes) {
            this._indexes![j] = tempIndexes[j]!;
            this._indexes![j]![1](() => j!);
          }
        } else {
          this._mappings[j] = runWithOwner<MappedItem>((this._nodes[j] = createOwner()), mapper);
        }
      }

      // 3) in case the new set is shorter than the old, set the length of the mapped array
      this._mappings = this._mappings.slice(0, (this._len = newLen));

      // 4) save a copy of the mapped items for the next update
      this._items = newItems.slice(0);
    }
  });

  return this._mappings;
}

function compare<Item>(key: ((i: any) => any) | undefined, a: Item, b: Item): boolean {
  return key ? key(a) === key(b) : true;
}

interface MapData<Item = any, MappedItem = any> {
  _owner: Root;
  _len: number;
  _list: Accessor<Maybe<readonly Item[]>>;
  _items: Item[];
  _mappings: MappedItem[];
  _nodes: Root[];
  _map: (value: any, index: any) => any;
  _key: ((i: any) => any) | undefined;
  _rows?: Signal<Item>[];
  _indexes?: Signal<number>[];
  _unkeyed?: boolean;
  _recycle?: boolean;
  _fallback?: Accessor<any>;
}
