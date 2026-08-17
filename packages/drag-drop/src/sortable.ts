import { isServer } from "@solidjs/web";
import { noop } from "@solid-primitives/utils";
import { createDraggable } from "./draggable.ts";
import { createDroppable } from "./droppable.ts";
import type { SortableReturn } from "./types.ts";

/**
 * Reorders an array by moving the item at `from` to `to`, returning a new array —
 * the array itself and the item order at both indices are left untouched if either
 * index is out of range or they're equal. Pairs naturally with `createDragContext`'s
 * `onDragEnd` for reordering a `createSortable` list.
 *
 * @example
 * ```ts
 * const ctx = createDragContext({
 *   onDragEnd: (dragged, over) => {
 *     if (!over) return;
 *     setItems(items => arrayMove(
 *       items,
 *       items.findIndex(i => i.id === dragged.id),
 *       items.findIndex(i => i.id === over.id),
 *     ));
 *   },
 * });
 * ```
 */
export function arrayMove<T>(array: readonly T[], from: number, to: number): T[] {
  const next = array.slice();
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from >= array.length ||
    to < 0 ||
    to >= array.length ||
    from === to
  ) {
    return next;
  }
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

/**
 * Combines `createDraggable` and `createDroppable` on the same element.
 * The element can both be dragged and serve as a drop target for other items.
 *
 * When inside a `createDragContext`, a sortable never registers as its own
 * drop target — the context filters out the active draggable from collision
 * detection, so `isOver` is always false while this item is being dragged.
 *
 * @example
 * ```tsx
 * const [items, setItems] = createSignal(["A", "B", "C"]);
 *
 * <For each={items()}>
 *   {(item) => {
 *     const sortable = createSortable(item);
 *     return (
 *       <div ref={sortable.ref} class={sortable.isActiveDropzone() ? "ring-2" : ""}>
 *         {item}
 *       </div>
 *     );
 *   }}
 * </For>
 * ```
 */
export function createSortable<T = unknown>(
  id: string | number,
  data?: T,
): SortableReturn<T> {
  if (isServer) {
    return {
      ref: noop,
      isDragging: () => false,
      transform: () => null,
      isOver: () => false,
      active: () => null,
      isActiveDropzone: () => false,
      id,
    };
  }

  const draggable = createDraggable(id, data);
  const droppable = createDroppable(id, data);

  const ref = (el: HTMLElement) => {
    draggable.ref(el);
    droppable.ref(el);
  };

  return {
    ref,
    isDragging: draggable.isDragging,
    transform: draggable.transform,
    isOver: droppable.isOver,
    active: droppable.active,
    isActiveDropzone: droppable.isOver,
    id,
  };
}
