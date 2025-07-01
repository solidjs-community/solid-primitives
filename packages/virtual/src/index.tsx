import { For, createMemo, createSignal } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { access } from "@solid-primitives/utils";
import type { MaybeAccessor } from "@solid-primitives/utils";

type VirtualListConfig<T extends readonly any[]> = {
  items: MaybeAccessor<T | undefined | null | false>;
  rootHeight: MaybeAccessor<number>;
  overscanCount?: MaybeAccessor<number>;
  rowHeight: MaybeAccessor<number | ((row: T[number], index: number) => number)>;
};

type VirtualListReturn<T extends readonly any[]> = [
  Accessor<{
    containerHeight: number;
    viewerTop: number;
    visibleItems: T;
  }>,
  onScroll: (e: Event) => void,
  { scrollToItem: (itemIndex: number, scrollContainer: HTMLElement) => void },
];

/**
 * A headless virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) utility for constructing your own virtualized list components with maximum flexibility.
 *
 * @param items the list of items
 * @param rootHeight the height of the root element of the virtualizedList
 * @param rowHeight the height of individual rows in the virtualizedList
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @returns {VirtualListReturn} to use in the list's jsx
 */
export function createVirtualList<T extends readonly any[]>({
  items,
  rootHeight,
  rowHeight,
  overscanCount,
}: VirtualListConfig<T>): VirtualListReturn<T> {
  items = access(items) || ([] as any as T);
  rootHeight = access(rootHeight);
  rowHeight = access(rowHeight);
  overscanCount = access(overscanCount) || 1;

  const resolveRowHeight =
    typeof rowHeight === "function" ? rowHeight : (_: T[number], _i: number) => rowHeight;

  const [offset, setOffset] = createSignal(0);

  const rowOffsets = createMemo(() => {
    let offset = 0;
    return items.map((item, i) => {
      const current = offset;
      offset += resolveRowHeight(item, i);
      return current;
    });
  });

  // Binary Search for performance
  const findRowIndexAtOffset = (offset: number) => {
    const offsets = rowOffsets();

    let lo = 0,
      hi = offsets.length - 1,
      mid: number;
    while (lo <= hi) {
      mid = (lo + hi) >>> 1;
      if (offsets[mid]! > offset) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    return lo;
  };

  const getFirstIdx = () => Math.max(0, findRowIndexAtOffset(offset()) - overscanCount);

  // const getFirstIdx = () => Math.max(0, Math.floor(offset() / rowHeight) - overscanCount);

  const getLastIdx = () =>
    Math.min(items.length, findRowIndexAtOffset(offset() + rootHeight) + overscanCount);

  // const getLastIdx = () =>
  //   Math.min(
  //     items.length,
  //     Math.floor(offset() / rowHeight) + Math.ceil(rootHeight / rowHeight) + overscanCount,
  //   );

  return [
    () => ({
      containerHeight: items.length !== 0 ? rowOffsets()[items.length - 1]! : 0,
      viewerTop: rowOffsets()[getFirstIdx()]!,
      visibleItems: items.slice(getFirstIdx(), getLastIdx()) as unknown as T,
    }),
    e => {
      // @ts-expect-error
      if (e.target?.scrollTop !== undefined) setOffset(e.target.scrollTop);
    },
    {
      scrollToItem: (itemIndex: number, scrollContainer: HTMLElement) => {
        scrollContainer.scrollTop = rowOffsets()[itemIndex]!;
      },
    },
  ];
}

type VirtualListProps<T extends readonly any[], U extends JSX.Element> = {
  children: (item: T[number], index: Accessor<number>) => U;
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  overscanCount?: number;
  rowHeight: number | ((row: T[number], index: number) => number);
  rootHeight: number;
  setScrollToItem: (scrollToItem: (itemIndex: number) => void) => void;
};

/**
 * A basic, unstyled virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) component you can drop into projects without modification
 *
 * @param children the flowComponent that will be used to transform the items into rows in the list
 * @param each the list of items
 * @param fallback the optional fallback to display if the list of items to display is empty
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @param rootHeight the height of the root element of the virtualizedList itself
 * @param rowHeight the height of individual rows in the virtualizedList—can be static if just a number is provided, or dynamic if a callback is passed
 * @returns virtualized list component
 */
export function VirtualList<T extends readonly any[], U extends JSX.Element>(
  props: VirtualListProps<T, U>,
): JSX.Element {
  const [virtual, onScroll, { scrollToItem }] = createVirtualList({
    items: () => props.each,
    rootHeight: () => props.rootHeight,
    rowHeight: () => props.rowHeight,
    overscanCount: () => props.overscanCount || 1,
  });

  props.setScrollToItem((itemIndex: number) => scrollToItem(itemIndex, scrollContainer));

  let scrollContainer!: HTMLDivElement;

  return (
    <div
      ref={scrollContainer}
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
          style={{
            position: "absolute",
            top: `${virtual().viewerTop}px`,
          }}
        >
          <For fallback={props.fallback} each={virtual().visibleItems}>
            {props.children}
          </For>
        </div>
      </div>
    </div>
  );
}
