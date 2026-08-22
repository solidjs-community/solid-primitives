import { For, createMemo, createSignal, type Accessor, type JSX } from "solid-js";
import { isServer } from "solid-js/web";
import { access, type MaybeAccessor } from "@solid-primitives/utils";

export type RowHeightFn<T> = (item: T, index: number) => number;

export type VirtualListConfig<T extends readonly any[]> = {
  items: MaybeAccessor<T | undefined | null | false>;
  rootHeight: MaybeAccessor<number>;
  rowHeight: MaybeAccessor<number | RowHeightFn<T[number]>>;
  overscanCount?: MaybeAccessor<number>;
};

export type VirtualListReturn<T extends readonly any[]> = [
  state: Accessor<{
    containerHeight: number;
    viewerTop: number;
    visibleItems: T;
    startIndex: number;
    endIndex: number;
  }>,
  onScroll: (e: Event) => void,
  controls: {
    getFirstIdx: () => number;
    getLastIdx: () => number;
    scrollToIndex: (index: number, container?: HTMLElement | null, behavior?: ScrollBehavior) => void;
  },
];

export function createVirtualList<T extends readonly any[]>(
  cfg: VirtualListConfig<T>,
): VirtualListReturn<T> {
  const items = () => access(cfg.items) || ([] as unknown as T);
  const overscanCount = () => access(cfg.overscanCount) ?? 1;
  const [offset, setOffset] = createSignal(0);

  const rowMetrics = createMemo(() => {
    const list = items();
    const len = list.length;
    if (len === 0) {
      return { offsets: [] as number[], heights: [] as number[], totalHeight: 0 };
    }

    const rowHeightCfg = access(cfg.rowHeight);
    const isDynamic = typeof rowHeightCfg === "function";

    if (!isDynamic) {
      const fixedH = typeof rowHeightCfg === "number" ? rowHeightCfg : 24;
      const offsets = new Array<number>(len);
      const heights = new Array<number>(len);
      for (let i = 0; i < len; i++) {
        offsets[i] = i * fixedH;
        heights[i] = fixedH;
      }
      return { offsets, heights, totalHeight: len * fixedH };
    }

    const offsets = new Array<number>(len);
    const heights = new Array<number>(len);
    let accum = 0;
    const dynamicFn = rowHeightCfg as RowHeightFn<T[number]>;

    for (let i = 0; i < len; i++) {
      offsets[i] = accum;
      const h = dynamicFn(list[i], i);
      heights[i] = h;
      accum += h;
    }

    return { offsets, heights, totalHeight: accum };
  });

  const findRowIndexAtOffset = (targetOffset: number): number => {
    const { offsets } = rowMetrics();
    const len = offsets.length;
    if (len === 0) return 0;
    if (targetOffset <= 0) return 0;
    if (targetOffset >= offsets[len - 1]!) return len - 1;

    let lo = 0;
    let hi = len - 1;

    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const midOffset = offsets[mid]!;

      if (midOffset === targetOffset) return mid;
      if (midOffset < targetOffset) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return Math.max(0, lo - 1);
  };

  const getFirstIdx = () => {
    const start = findRowIndexAtOffset(offset());
    return Math.max(0, start - overscanCount());
  };

  const getLastIdx = () => {
    const end = findRowIndexAtOffset(offset() + access(cfg.rootHeight));
    return Math.min(items().length, end + 1 + overscanCount());
  };

  const scrollToIndex = (
    index: number,
    container?: HTMLElement | null,
    behavior: ScrollBehavior = "auto",
  ) => {
    if (isServer || !container) return;
    const { offsets } = rowMetrics();
    const clamped = Math.max(0, Math.min(index, offsets.length - 1));
    const targetTop = offsets[clamped] ?? 0;
    container.scrollTo({ top: targetTop, behavior });
  };

  return [
    () => {
      const { offsets, totalHeight } = rowMetrics();
      const first = getFirstIdx();
      const last = getLastIdx();
      const list = items();

      return {
        containerHeight: totalHeight,
        viewerTop: offsets[first] ?? 0,
        visibleItems: list.slice(first, last) as unknown as T,
        startIndex: first,
        endIndex: last,
      };
    },
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && typeof target.scrollTop === "number") {
        setOffset(target.scrollTop);
      }
    },
    {
      getFirstIdx,
      getLastIdx,
      scrollToIndex,
    },
  ];
}

export type VirtualListProps<T extends readonly any[], U extends JSX.Element> = {
  each: T | undefined | null | false;
  children: (item: T[number], index: Accessor<number>) => U;
  rootHeight: number;
  rowHeight: number | RowHeightFn<T[number]>;
  overscanCount?: number;
  fallback?: JSX.Element;
  ref?: (el: HTMLDivElement) => void;
};

export function VirtualList<T extends readonly any[], U extends JSX.Element>(
  props: VirtualListProps<T, U>,
): JSX.Element {
  const [virtual, onScroll] = createVirtualList({
    items: () => props.each,
    rootHeight: () => props.rootHeight,
    rowHeight: () => props.rowHeight,
    overscanCount: () => props.overscanCount,
  });

  return (
    <div
      ref={props.ref}
      style={{
        overflow: "auto",
        height: `${props.rootHeight}px`,
        position: "relative",
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          height: `${virtual().containerHeight}px`,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${virtual().viewerTop}px`,
            left: 0,
            right: 0,
          }}
        >
          <For fallback={props.fallback} each={virtual().visibleItems}>
            {(item, idx) => props.children(item, () => virtual().startIndex + idx())}
          </For>
        </div>
      </div>
    </div>
  );
}
