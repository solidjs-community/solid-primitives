import { asArray, Many, MaybeAccessor } from "@solid-primitives/utils";
import { createEffect, onCleanup, on } from "solid-js";

export type ResizeHandler = (
  rect: DOMRectReadOnly,
  element: Element,
  entry: ResizeObserverEntry
) => void;

function handleDiffArray<T>(
  current: T[],
  prev: T[],
  handleRemoved: (item: T) => void,
  handleAdded: (item: T) => void
): void {
  const currLength = current.length;
  const prevLength = prev.length;
  let i = 0;

  if (!prevLength) {
    for (; i < currLength; i++) handleAdded(current[i]);
    return;
  }

  if (!currLength) {
    for (; i < prevLength; i++) handleRemoved(prev[i]);
    return;
  }

  let prevEl: T;
  let currEl: T;

  for (; i < prevLength; i++) {
    if (prev[i] !== current[i]) break;
  }
  for (let j = i; j < prevLength; j++) {
    prevEl = prev[i];
    if (!current.includes(prevEl)) handleRemoved(prevEl);
  }
  for (; i < currLength; i++) {
    currEl = current[i];
    if (!prev.includes(currEl)) handleAdded(currEl);
  }
}

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

  if (typeof targets === "function") {
    createEffect(
      on(
        () => asArray(targets()),
        (current, prev = []) => handleDiffArray(current, prev, unobserve, observe)
      )
    );
  } else {
    asArray(targets).forEach(observe);
  }
}
