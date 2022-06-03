import { asArray, Many, MaybeAccessor, handleDiffArray } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createEffect, onCleanup, on, $PROXY, $TRACK, Accessor, createMemo } from "solid-js";

export type ResizeHandler = (
  rect: DOMRectReadOnly,
  element: Element,
  entry: ResizeObserverEntry
) => void;

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
 * Create resize observer is a helper primitive for binding resize events.
 *
 * @param opts.refs - Either an `Element`, an array of `Element`s, or a signal returning one of these.
 * @param opts.onResize - Function handler to trigger on resize
 * @return A callback that can be used to add refs to observe resizing
 *
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
