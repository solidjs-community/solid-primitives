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

  const [current, setCurrent] = createSignal<T>(target());
  let startValue = target();
  let start = 0;
  let delta: number;
  let cancelId: number;

  function tick(t: number) {
    const elapsed = t - start;

    if (elapsed < duration) {
      // @ts-ignore
      setCurrent(startValue + ease(elapsed / duration) * delta);
      cancelId = requestAnimationFrame(tick);
    }
    else {
      // @ts-ignore
      setCurrent(target());
    }
  }

  createEffect(on(target, () => {
    start = performance.now();
    startValue = current();
    delta = target() - startValue;
    cancelId = requestAnimationFrame(tick);
    onCleanup(() => cancelAnimationFrame(cancelId));
  }, { defer: true }));

  return current;
}

// TODO: in a major release, remove the default export
export { createTween };
