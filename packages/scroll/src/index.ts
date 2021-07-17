import { createSignal, onCleanup, createEffect } from 'solid-js';

/**
 * Create a primitive for monitoring scrolling.
 *
 * @param target - Element or window to target, defaults to window
 *
 * @example
 * ```ts
 * let ref;
 * const position = createScrollObserver(() => ref)
 * ```
 */
 const createScrollObserver = <T extends HTMLElement>(
  target: () => T | Window = () => window
): (() => number | null) => {
  const getPosition = (): number | null =>
    // @ts-ignore
    target && typeof target() !== "undefined" ? target().pageYOffset : null;
  const [position, setPosition] = createSignal<number | null>(getPosition());
  const handleScroll = () => setPosition(getPosition());
  const remove = () => target() && target().removeEventListener("scroll", handleScroll);
  createEffect(() => {
    if (!target()) {
      return;
    } else if (target()) {
      remove();
    }
    target().addEventListener("scroll", handleScroll);
  });
  onCleanup(remove);
  return position;
};

export default createScrollObserver;
