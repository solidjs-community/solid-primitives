import { For, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { access } from "@solid-primitives/utils";
import type { MaybeAccessor } from "@solid-primitives/utils";

/**
 * A row height: either one number shared by every row, or a function returning the height of the
 * row at a given index (for known, variable heights).
 *
 * A function must declare its `index` parameter (`i => ...`). A zero-parameter function is treated
 * as an accessor of the row height (reactive fixed height), as it always has been.
 */
export type RowHeight = number | ((index: number) => number);

type RowHeightConfig =
  | {
      /** the height of rows: a number, a `(index) => number` function, or an accessor of either */
      rowHeight: RowHeight | Accessor<RowHeight>;
      /** opt in to measured mode: rows are estimated at this height until measured via `measureElement` */
      estimatedRowHeight?: MaybeAccessor<number>;
    }
  | {
      rowHeight?: RowHeight | Accessor<RowHeight>;
      estimatedRowHeight: MaybeAccessor<number>;
    };

type VirtualListConfig<T extends readonly any[]> = {
  items: MaybeAccessor<T | undefined | null | false>;
  rootHeight: MaybeAccessor<number>;
  overscanCount?: MaybeAccessor<number>;
} & RowHeightConfig;

type VirtualListState<T extends readonly any[]> = {
  containerHeight: number;
  viewerTop: number;
  visibleItems: T;
  firstIndex: number;
  lastIndex: number | undefined;
  /** the offset (distance from the top of the list) of each row in `visibleItems`, in the same order */
  offsets: number[];
};

type VirtualListHelpers = {
  /** the offset (distance from the top of the list) of the row at `index`; `index === length` gives the total height */
  getRowOffset: (index: number) => number;
  /** the height of the row at `index` (the measured height if known, otherwise the known/estimated one) */
  getRowHeight: (index: number) => number;
  /**
   * Records the real height of a rendered row (measured mode). Reads the row index from the
   * element's `data-index` attribute unless `index` is given, measures immediately and keeps
   * measuring with a `ResizeObserver` where available. Safe to call repeatedly; no-op on the server.
   * Elements with no layout (height 0) are ignored.
   */
  measureElement: (el: Element | null | undefined, index?: number) => void;
  /** stops observing an element passed to `measureElement` (also happens automatically when it is disconnected) */
  unmeasureElement: (el: Element | null | undefined) => void;
  /** forgets every measured height and re-measures the elements currently observed */
  resetMeasurements: () => void;
  /**
   * Scrolls the row at `index` to the top of the viewport. Uses the scroll container seen by
   * `onScroll` unless `scroller` is passed.
   */
  scrollToIndex: (index: number, scroller?: Element | null) => void;
};

type VirtualListReturn<T extends readonly any[]> = [
  Accessor<VirtualListState<T>>,
  onScroll: (e: Event) => void,
  helpers: VirtualListHelpers,
];

// a zero-parameter function is an accessor, anything else is the value itself
const resolveRowHeight = (v: unknown): RowHeight | undefined =>
  (typeof v === "function" && v.length === 0 ? v() : v) as RowHeight | undefined;

/** number of entries in `prefix[0..n-1]` that are <= y (prefix is sorted ascending) */
const countAtMost = (prefix: Float64Array, n: number, y: number): number => {
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (prefix[mid]! <= y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/** number of entries in `prefix[0..n-1]` that are < y */
const countBefore = (prefix: Float64Array, n: number, y: number): number => {
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (prefix[mid]! < y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/**
 * A headless virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) utility for constructing your own virtualized list components with maximum flexibility.
 *
 * @param items the list of items
 * @param rootHeight the height of the root element of the virtualizedList
 * @param rowHeight the height of individual rows: a number (fixed fast path), or a `(index) => number` function for known variable heights
 * @param estimatedRowHeight opt-in measured mode: unmeasured rows are assumed to be this tall until `measureElement` records their real height
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @returns `[state, onScroll, helpers]` to use in the list's jsx
 */
export function createVirtualList<T extends readonly any[]>({
  items,
  rootHeight,
  rowHeight,
  estimatedRowHeight,
  overscanCount,
}: VirtualListConfig<T>): VirtualListReturn<T> {
  const [offset, setOffset] = createSignal(0, { ownedWrite: true });
  const [version, setVersion] = createSignal(0, { ownedWrite: true });

  const getItems = () => (access(items) || []) as unknown as T;
  const getRootHeight = () => access(rootHeight);
  const getRowHeight = () => resolveRowHeight(rowHeight);
  const getEstimate = () =>
    estimatedRowHeight === undefined ? undefined : access(estimatedRowHeight);
  const getOverscanCount = () => access(overscanCount) || 1;

  const measured = new Map<number, number>();
  const observed = new Map<Element, number | undefined>();
  let observer: ResizeObserver | undefined;
  let scroller: Element | null = null;

  const heightAt = (
    index: number,
    source: RowHeight | undefined,
    estimate: number | undefined,
  ): number => {
    if (estimate !== undefined) {
      const known = measured.get(index);
      if (known !== undefined) return known;
    }
    if (typeof source === "function") return source(index);
    return estimate ?? source ?? 0;
  };

  // prefix sums: prefix[i] is the offset of row i, prefix[n] is the total height
  const layout = createMemo(() => {
    version();
    const n = getItems().length;
    const source = getRowHeight();
    const estimate = getEstimate();
    for (const key of measured.keys()) if (key >= n) measured.delete(key);
    const prefix = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i]! + heightAt(i, source, estimate);
    return prefix;
  });

  const isFixed = () => typeof getRowHeight() === "number" && getEstimate() === undefined;

  const getRowOffset = (index: number): number => {
    const n = getItems().length;
    const i = Math.min(Math.max(0, Math.floor(index)), n);
    if (isFixed()) return i * (getRowHeight() as number);
    return layout()[i]!;
  };

  const getHeightOf = (index: number): number => {
    const source = getRowHeight();
    const estimate = getEstimate();
    if (typeof source === "number" && estimate === undefined) return source;
    return heightAt(index, source, estimate);
  };

  // ---- measuring ----

  const indexOf = (el: Element): number => {
    const explicit = observed.get(el);
    if (explicit !== undefined) return explicit;
    const attr = el.getAttribute("data-index");
    return attr === null ? NaN : Number(attr);
  };

  const commit = (updates: Array<[number, number]>) => {
    let changed = false;
    for (const [index, height] of updates) {
      if (!Number.isInteger(index) || index < 0 || !(height > 0)) continue;
      const prev = measured.get(index);
      if (prev === undefined || Math.abs(prev - height) > 0.01) {
        measured.set(index, height);
        changed = true;
      }
    }
    if (changed) setVersion(v => v + 1);
  };

  const unmeasureElement: VirtualListHelpers["unmeasureElement"] = el => {
    if (!el) return;
    observed.delete(el);
    observer?.unobserve(el);
  };

  const measureElement: VirtualListHelpers["measureElement"] = (el, index) => {
    if (isServer || !el) return;
    observed.set(el, index);
    if (!observer && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(entries => {
        const updates: Array<[number, number]> = [];
        for (const entry of entries) {
          const target = entry.target;
          if (!target.isConnected) {
            unmeasureElement(target);
            continue;
          }
          const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          updates.push([indexOf(target), height]);
        }
        commit(updates);
      });
    }
    observer?.observe(el);
    commit([[indexOf(el), el.getBoundingClientRect().height]]);
  };

  const resetMeasurements = () => {
    measured.clear();
    const updates: Array<[number, number]> = [];
    for (const el of observed.keys())
      updates.push([indexOf(el), el.getBoundingClientRect().height]);
    setVersion(v => v + 1);
    commit(updates);
  };

  onCleanup(() => {
    observer?.disconnect();
    observer = undefined;
    observed.clear();
    scroller = null;
  });

  const scrollToIndex: VirtualListHelpers["scrollToIndex"] = (index, el = scroller) => {
    const n = getItems().length;
    if (n === 0) return;
    const top = getRowOffset(Math.min(Math.max(0, index), n - 1));
    if (el) el.scrollTop = top;
    setOffset(top);
  };

  return [
    () => {
      const resolvedItems = getItems();
      const source = getRowHeight();
      const estimate = getEstimate();
      const currentOffset = offset();
      const overscan = getOverscanCount();

      // fixed-height fast path: no prefix sums, no search
      if (typeof source === "number" && estimate === undefined) {
        const rowH = source;
        const firstIdx = Math.max(0, Math.floor(currentOffset / rowH) - overscan);
        const lastIdx = Math.min(
          resolvedItems.length,
          Math.floor(currentOffset / rowH) + Math.ceil(getRootHeight() / rowH) + overscan,
        );
        const offsets: number[] = [];
        for (let i = firstIdx; i < lastIdx; i++) offsets.push(i * rowH);
        return {
          containerHeight: resolvedItems.length * rowH,
          viewerTop: firstIdx * rowH,
          visibleItems: resolvedItems.slice(firstIdx, lastIdx) as unknown as T,
          firstIndex: firstIdx,
          // -1 because slice is an exclusive range
          lastIndex: lastIdx > 0 ? lastIdx - 1 : undefined,
          offsets,
        };
      }

      const prefix = layout();
      const n = resolvedItems.length;
      const firstVisible = Math.max(0, countAtMost(prefix, n, currentOffset) - 1);
      const endVisible = countBefore(prefix, n, currentOffset + getRootHeight());
      const firstIdx = Math.max(0, firstVisible - overscan);
      const lastIdx = Math.min(n, endVisible + overscan);
      const offsets: number[] = [];
      for (let i = firstIdx; i < lastIdx; i++) offsets.push(prefix[i]!);
      return {
        containerHeight: prefix[n]!,
        viewerTop: prefix[firstIdx]!,
        visibleItems: resolvedItems.slice(firstIdx, lastIdx) as unknown as T,
        firstIndex: firstIdx,
        lastIndex: lastIdx > 0 ? lastIdx - 1 : undefined,
        offsets,
      };
    },
    e => {
      const target = e.target as HTMLElement | null;
      if (target?.scrollTop !== undefined) {
        scroller = target;
        setOffset(target.scrollTop);
      }
    },
    {
      getRowOffset,
      getRowHeight: getHeightOf,
      measureElement,
      unmeasureElement,
      resetMeasurements,
      scrollToIndex,
    },
  ];
}

type VirtualListProps<T extends readonly any[], U extends JSX.Element> = {
  children: (item: Accessor<T[number]>, index: number) => U;
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  class?: string;
  overscanCount?: number;
  rootHeight: number;
} & (
  | {
      rowHeight: RowHeight;
      /** opt-in measured mode: each row is wrapped in an element that is measured (see `createVirtualList`) */
      estimatedRowHeight?: number;
    }
  | { rowHeight?: RowHeight; estimatedRowHeight: number }
);

/**
 * A basic, unstyled virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) component you can drop into projects without modification
 *
 * @param children the flowComponent that will be used to transform the items into rows in the list
 * @param each the list of items
 * @param fallback the optional fallback to display if the list of items to display is empty
 * @param class an optional class applied to the element wrapping the rendered rows, useful for styling row layout (e.g. flex/grid)
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @param rootHeight the height of the root element of the virtualizedList itself
 * @param rowHeight the height of individual rows: a number, or a `(index) => number` function for known variable heights
 * @param estimatedRowHeight opt-in measured mode: rows are wrapped in a measured element and positioned from their real heights
 * @returns virtualized list component
 */
export function VirtualList<T extends readonly any[], U extends JSX.Element>(
  props: VirtualListProps<T, U>,
): JSX.Element {
  const [virtual, onScroll, { measureElement, unmeasureElement }] = createVirtualList({
    items: () => props.each,
    rootHeight: () => props.rootHeight,
    rowHeight: () => props.rowHeight as RowHeight,
    estimatedRowHeight: (() => props.estimatedRowHeight) as Accessor<number>,
    overscanCount: () => props.overscanCount || 1,
  } as VirtualListConfig<T>);

  return (
    <div
      style={{
        overflow: "auto",
        height: `${props.rootHeight}px`,
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${virtual().containerHeight}px`,
        }}
      >
        <div
          class={props.class}
          style={{
            position: "absolute",
            top: `${virtual().viewerTop}px`,
          }}
        >
          {props.estimatedRowHeight === undefined ? (
            <For fallback={props.fallback} each={virtual().visibleItems} keyed={false}>
              {props.children}
            </For>
          ) : (
            <For fallback={props.fallback} each={virtual().visibleItems} keyed={false}>
              {(item, i) => {
                let el!: HTMLDivElement;
                const index = () => virtual().firstIndex + i;
                onCleanup(() => unmeasureElement(el));
                createEffect(index, idx => measureElement(el, idx));
                return (
                  <div ref={el} data-index={index()}>
                    {props.children(item, i)}
                  </div>
                );
              }}
            </For>
          )}
        </div>
      </div>
    </div>
  );
}
