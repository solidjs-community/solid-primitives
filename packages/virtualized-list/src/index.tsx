import { For, createSignal } from "solid-js";
import type { Component, JSX } from "solid-js";

type VirtualizedListProps<T> = {
  class?: string;
  items: T[];
  overscanCount?: number;
  renderRow: (row: T) => JSX.Element;
  rootHeight: number;
  rowHeight: number;
};

/**
 * A basic virtualized list (see https://www.patterns.dev/vanilla/virtual-lists/) component for improving performance when rendering very large lists
 *
 * @param class the class applied to the root element of the virtualizedList
 * @param items the list of items
 * @param overscanCount the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
 * @param renderRow the component function that will be used to transform the items into rows in the table
 * @param rootHeight the height of the root element of the virtualizedList itself
 * @param rowHeight the height of individual rows in the virtualizedList
 * @return virtualized list component
 */
export const VirtualList: Component<VirtualizedListProps<any>> = <T,>(
  props: VirtualizedListProps<T>,
) => {
  let rootElement!: HTMLDivElement;

  const [offset, setOffset] = createSignal(0);

  const getFirstIdx = () =>
    Math.max(0, Math.floor(offset() / props.rowHeight) - (props.overscanCount || 1));

  const getLastIdx = () =>
    Math.min(
      props.items.length,
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
          height: `${props.items.length * props.rowHeight}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${getFirstIdx() * props.rowHeight}px`,
          }}
        >
          <For each={props.items.slice(getFirstIdx(), getLastIdx())}>
            {row => props.renderRow(row)}
          </For>
        </div>
      </div>
    </div>
  );
};
