import { For, createSignal } from "solid-js";
import type { Accessor, JSX } from "solid-js";

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
export function VirtualList<T extends readonly any[], U extends JSX.Element>(props: {
  children: (item: T[number], index: Accessor<number>) => U;
  fallback?: JSX.Element;
  class?: string;
  each: T | undefined | null | false;
  overscanCount?: number;
  rootHeight: number;
  rowHeight: number;
}): JSX.Element {
  let rootElement!: HTMLDivElement;

  const [offset, setOffset] = createSignal(0);
  const items = () => props.each || ([] as any as T);

  const getFirstIdx = () =>
    Math.max(0, Math.floor(offset() / props.rowHeight) - (props.overscanCount || 1));

  const getLastIdx = () =>
    Math.min(
      items().length,
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
          height: `${items().length * props.rowHeight}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${getFirstIdx() * props.rowHeight}px`,
          }}
        >
          <For
            fallback={props.fallback}
            each={items().slice(getFirstIdx(), getLastIdx()) as any as T}
          >
            {props.children}
          </For>
        </div>
      </div>
    </div>
  );
}
