import { createSignal, createEffect, onCleanup, on, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export type VectorRecord = Record<string, number>;

export interface VectorTweenProps {
  duration?: number;
  ease?: (t: number) => number;
}

export function createVectorTween<T extends VectorRecord>(
  target: Accessor<T>,
  { ease = (t: number) => t, duration = 100 }: VectorTweenProps = {},
): Accessor<T> {
  if (isServer) {
    return target;
  }

  const initial = target();
  const [current, setCurrent] = createSignal<T>({ ...initial });

  let start: number;
  let startValues: T;
  let cancelId: number | null = null;

  function tick(t: number) {
    const elapsed = t - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = ease(progress);

    const dest = target();
    const next = {} as T;

    for (const key of Object.keys(dest) as (keyof T)[]) {
      const s = startValues[key] ?? 0;
      const d = dest[key] ?? 0;
      next[key] = (s + (d - s) * easedProgress) as T[keyof T];
    }

    setCurrent(next);

    if (progress < 1) {
      cancelId = requestAnimationFrame(tick);
    } else {
      cancelId = null;
    }
  }

  createEffect(
    on(
      target,
      () => {
        start = performance.now();
        startValues = { ...current() };
        if (cancelId !== null) cancelAnimationFrame(cancelId);
        cancelId = requestAnimationFrame(tick);
        onCleanup(() => {
          if (cancelId !== null) {
            cancelAnimationFrame(cancelId);
            cancelId = null;
          }
        });
      },
      { defer: true },
    ),
  );

  onCleanup(() => {
    if (cancelId !== null) {
      cancelAnimationFrame(cancelId);
      cancelId = null;
    }
  });

  return current;
}
