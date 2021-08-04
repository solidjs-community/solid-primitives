import { createSignal, createEffect, onCleanup, on } from "solid-js";

/**
 * Creates a simple tween method.
 *
 * @param function Target to be modified
 * @param object Object representing the ease and duration
 * @returns Returns the tweening value
 *
 * @example
 * ```ts
 * const tweenedValue = createTween(myNumber, { duration: 500 });
 * ```
 */
export default function createTween<T extends number>(
  target: () => T,
  { ease = (t: T) => t, duration = 100 }
) {
  const [start, setStart] = createSignal(document.timeline.currentTime);
  const [current, setCurrent] = createSignal(target());
  createEffect(on(target, () => setStart(document.timeline.currentTime), { defer: true }));
  createEffect(
    on([start, current], () => {
      const cancelId = requestAnimationFrame(t => {
        const elapsed = t - start() + 1;
        setCurrent(c =>
          elapsed < duration ? (target() - c) * ease(elapsed / duration) + c : target()
        );
      });
      onCleanup(() => cancelAnimationFrame(cancelId));
    })
  );
  return current;
}
