import { createSelector } from "solid-js";

/**
 * Solid's `createReaction` that is based on pure computation *(runs before render, and is non-batching)*
 *
 * @param onInvalidate callback that runs when the tracked sources trigger update
 * @param options set computation name for debugging pourposes
 * - `options.initial` — an array of functions to be run initially and tracked. *(useful for runing code before other pure computations)*
 * @returns selector for the array
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/selectors#createArraySelector
 *
 * @example
 * const list: string[] = [...]
 * const [selectedItems] = createSignal<string[]>([])
 * const isSelected = createArraySelector(selectedItems)
 * <For each={list}>
 *   {(item) => <li classList={{ active: isSelected(item) }}>{item}</li>}
 * </For>
 */
export function createArraySelector<T>(
  source: () => Array<T>,
  options?: { name?: string },
): (k: T) => boolean {
  const selector = createSelector<Array<T>, T>(
    source,
    (a, b) => {
      return b.includes(a);
    },
    options,
  );
  return selector;
}
