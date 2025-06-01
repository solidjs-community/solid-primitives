import { createSignal, createEffect, onCleanup, on } from "solid-js";
import { isServer } from "solid-js/web";

export type TweenProps = {
  duration?: number;
  ease?: (t: number) => number;
};

/**
 * Creates a simple tween method.
 *
 * @param function Target to be modified
 * @param object Object representing the ease and duration
 * @returns Returns the tweening value
 *
 * @example
 * ```ts
 * const [value, setValue] = createSignal(100);
 * const tweenedValue = createTween(value, {
 *   duration: 500,
 *   ease: (t) => 0.5 - Math.cos(Math.PI * t) / 2
 * });
 * ```
 * ```jsx
 * <button onClick={() => setValue(value() === 0 ? 100 : 0)}>
 *   {Math.round(tweenedValue())}
 * </button>
 * ```
 */
export default function createTween(
  target: () => number,
  { ease = (t: number) => t, duration = 100 }: TweenProps,
): () => number {
  console.log('createTween invoke')
  if (isServer) {
    return target;
  }

  const [current, setCurrent] = createSignal(target());
  let start: number;
  let startValue: number;
  let delta: number;
  let cancelId: number;

  function tick(t: number) {
    console.log('createTween tick', t)
    const elapsed = t - start;

    if (elapsed < duration) {
      setCurrent(startValue + ease(elapsed / duration) * delta);
      cancelId = requestAnimationFrame(tick);
    } else {
      setCurrent(target());
    }
  }


  // effect doesn't refire when target signal updates
  createEffect(
    () => {
      console.log('createTween effect on target: ', target())
    },
  );

  createEffect(
    on(
      target,
      () => {
        console.log('createTween deferred effect')
        start = performance.now();
        startValue = current();
        delta = target() - startValue;
        cancelId = requestAnimationFrame(tick);
        onCleanup(() => cancelAnimationFrame(cancelId));
      },
      { defer: true },
    ),
  );

  return current;
}

// TODO: in a major release, remove the default export
export { createTween };
