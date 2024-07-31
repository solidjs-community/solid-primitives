import { For, createSignal } from "solid-js";
import type { Component, JSX } from "solid-js";

type VirtualizedListProps<T, U extends JSX.Element> = {
  children: (item: T) => U;
  class?: string;
  each: readonly T[];
  overscanCount?: number;
  rootHeight: number;
  rowHeight: number;
};

/**
 * A basic virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) component for improving performance when rendering very large lists
 *
 * @param children the flowComponent that will be used to transform the items into rows in the list
 * @param class the class applied to the root element of the virtualizedList
 * @param each the list of items
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @param rootHeight the height of the root element of the virtualizedList itself
 * @param rowHeight the height of individual rows in the virtualizedList
 * @return virtualized list component
 */
export const VirtualList: Component<VirtualizedListProps<any, any>> = <T, U extends JSX.Element>(
  props: VirtualizedListProps<T, U>,
) => {
  let rootElement!: HTMLDivElement;

  const [offset, setOffset] = createSignal(0);

  const getFirstIdx = () =>
    Math.max(0, Math.floor(offset() / props.rowHeight) - (props.overscanCount || 1));

  const getLastIdx = () =>
    Math.min(
      props.each.length,
      Math.floor(offset() / props.rowHeight) +
        Math.ceil(props.rootHeight / props.rowHeight) +
        (props.overscanCount || 1),
    );

  return (
    <div
      ref={rootElement}
      style={{
        overflow: "auto",
        height: `${props.rootHeight}px`,
      }}
      class={props.class}
      onScroll={() => {
        setOffset(rootElement.scrollTop);
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${props.each.length * props.rowHeight}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${getFirstIdx() * props.rowHeight}px`,
          }}
        >
          <For each={props.each.slice(getFirstIdx(), getLastIdx())}>{props.children}</For>
        </div>
      </div>
    </div>
  );
};
