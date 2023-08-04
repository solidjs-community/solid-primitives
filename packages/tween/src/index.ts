import { createSignal, createEffect, onCleanup, on } from "solid-js";
import { isServer } from "solid-js/web";

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
  { ease = (t: T) => t, duration = 100 },
): () => T {
  if (isServer) {
    return target;
  }

  const [start, setStart] = createSignal(performance.now());
  const [current, setCurrent] = createSignal<T>(target());
  createEffect(on(target, () => setStart(performance.now()), { defer: true }));
  createEffect(
    on([start, current], () => {
      const cancelId = requestAnimationFrame(t => {
        const elapsed = t - (start() || 0) + 1;
        // @ts-ignore
        setCurrent(c =>
          elapsed < duration ? (target() - c) * ease((elapsed / duration) as T) + c : target(),
        );
      });
      onCleanup(() => cancelAnimationFrame(cancelId));
    }),
  );
  return current;
}

// TODO: in a major release, remove the default export
export { createTween };
