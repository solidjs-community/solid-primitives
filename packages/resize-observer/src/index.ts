import { asArray, Many, MaybeAccessor, handleDiffArray } from "@solid-primitives/utils";
import { createEffect, onCleanup, on, $PROXY, $TRACK, Accessor } from "solid-js";

export type ResizeHandler = (
  rect: DOMRectReadOnly,
  element: Element,
  entry: ResizeObserverEntry
) => void;

/**
 * Instantiate a new ResizeObserver that automatically get's disposed on cleanup.
 *
 * @param callback handler called once element size changes
 * @param options ResizeObserver options
 * @returns `observe` and `unobserve` functions
 */
export function makeResizeObserver<T extends Element>(
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
): {
  observe: (ref: T) => void;
  unobserve: (ref: T) => void;
} {
  const resizeObserver = new ResizeObserver(callback);
  onCleanup(resizeObserver.disconnect.bind(resizeObserver));
  return {
    observe: ref => resizeObserver.observe(ref, options),
    unobserve: resizeObserver.unobserve.bind(resizeObserver)
  };
}

/**
 * Create resize observer instance, listening for changes to size of the reactive {@link targets} array.
 *
 * @param targets Elements to be observed. Can be a reactive signal or store top-level array.
 * @param onResize - Function handler to trigger on element resize
 *
 * @example
 * ```tsx
 * let ref
 * createResizeObserver(() => ref, ({ width, height }, el) => {
 *   if (el === ref) console.log(width, height)
 * });
 * <div ref={ref}/>
 * ```
 */
export function createResizeObserver<T extends Element>(
  targets: MaybeAccessor<Many<T>>,
  onResize: ResizeHandler,
  options?: ResizeObserverOptions
): void {
  const previousMap = new WeakMap<Element, { width: number; height: number }>();
  const { observe, unobserve } = makeResizeObserver(handleObserverCallback, options);

  function handleObserverCallback(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const { contentRect, target } = entry;
      const width = Math.round(contentRect.width);
      const height = Math.round(contentRect.height);
      const previous = previousMap.get(target);
      if (!previous || previous.width !== width || previous.height !== height) {
        onResize(contentRect, entry.target, entry);
        previousMap.set(target, { width, height });
      }
    }
  }

  let refs: Accessor<T[]> | undefined;
  // is an signal
  if (typeof targets === "function") refs = () => asArray(targets()).slice() as T[];
  // is a store array
  else if (Array.isArray(targets) && $PROXY in targets)
    refs = () => {
      // track top-level store array
      (targets as any)[$TRACK];
      return targets.slice();
    };
  // is not reactive
  else {
    asArray(targets).forEach(observe);
    return;
  }

  createEffect(
    on(refs, (current, prev = []) => handleDiffArray(current, prev, observe, unobserve))
  );
}
