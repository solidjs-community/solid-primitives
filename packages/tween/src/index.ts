import { createSignal, createEffect, onCleanup, on } from "solid-js";
import { isServer } from "solid-js/web";

export * from "./spring.js";
export * from "./vector.js";

export type TweenProps = {
  duration?: number;
  ease?: (t: number) => number;
};

export default function createTween(
  target: () => number,
  { ease = (t: number) => t, duration = 100 }: TweenProps,
): () => number {
  if (isServer) {
    return target;
  }

  const [current, setCurrent] = createSignal(target());
  let start: number;
  let startValue: number;
  let delta: number;
  let cancelId: number;

  function tick(t: number) {
    const elapsed = t - start;

    if (elapsed < duration) {
      setCurrent(startValue + ease(elapsed / duration) * delta);
      cancelId = requestAnimationFrame(tick);
    } else {
      setCurrent(target());
    }
  }

  createEffect(
    on(
      target,
      () => {
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

export { createTween };
