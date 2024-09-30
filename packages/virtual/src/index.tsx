import { For, createSignal } from "solid-js";
import type { Accessor, JSX, Signal } from "solid-js";

/**
 * A headless virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) utility for constructing your own virtualized list components with maximum flexibility.
 *
 * @param rootElement accessor for the element to use as the root of the virtualized list
 * @param items the list of items
 * @param rootHeight the height of the root element of the virtualizedList
 * @param rowHeight the height of individual rows in the virtualizedList
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @returns an object whose properties are used by the list's components
 */
export function createVirtualList<T extends readonly any[]>({
  rootElement,
  items,
  rootHeight,
  rowHeight,
  overscanCount,
}: {
  rootElement: Accessor<Element>;
  items: T | undefined | null | false;
  rootHeight: number;
  rowHeight: number;
  overscanCount?: number;
}): {
  onScroll: VoidFunction;
  containerHeight: () => number;
  viewerTop: () => number;
  visibleItems: () => readonly T[];
} {
  items = items || ([] as any as T);
  overscanCount = overscanCount || 1;

  const [offset, setOffset] = createSignal(0);

  const getFirstIdx = () => Math.max(0, Math.floor(offset() / rowHeight) - overscanCount);

  const getLastIdx = () =>
    Math.min(
      items.length,
      Math.floor(offset() / rowHeight) + Math.ceil(rootHeight / rowHeight) + overscanCount,
    );

  return {
    onScroll: () => {
      setOffset(rootElement().scrollTop);
    },
    containerHeight: () => items.length * rowHeight,
    viewerTop: () => getFirstIdx() * rowHeight,
    visibleItems: () => items.slice(getFirstIdx(), getLastIdx()),
  };
}

/**
 * A basic, unstyled virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) component you can drop into projects without modification
 *
 * @param children the flowComponent that will be used to transform the items into rows in the list
 * @param each the list of items
 * @param fallback the optional fallback to display if the list of items to display is empty
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @param rootHeight the height of the root element of the virtualizedList itself
 * @param rowHeight the height of individual rows in the virtualizedList
 * @returns virtualized list component
 */
export function VirtualList<T extends readonly any[], U extends JSX.Element>(props: {
  children: (item: T[number], index: Accessor<number>) => U;
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  overscanCount?: number;
  rootHeight: number;
  rowHeight: number;
}): JSX.Element {
  const [rootElement, setRootElement] = createSignal() as Signal<HTMLDivElement>;

  const { onScroll, containerHeight, viewerTop, visibleItems } = createVirtualList({
    rootElement,
    items: props.each,
    rootHeight: props.rootHeight,
    rowHeight: props.rowHeight,
    overscanCount: props.overscanCount,
  });

  return (
    <div
      ref={setRootElement}
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
          height: `${containerHeight()}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${viewerTop()}px`,
          }}
        >
          <For fallback={props.fallback} each={visibleItems() as unknown as T}>
            {props.children}
          </For>
        </div>
      </div>
    </div>
  );
}
