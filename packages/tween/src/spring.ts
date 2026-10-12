import { createSignal, createEffect, onCleanup, on, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  precision?: number;
}

export function createSpringTween(
  target: Accessor<number>,
  options: SpringOptions = {},
): Accessor<number> {
  if (isServer) {
    return target;
  }

  const stiffness = options.stiffness ?? 0.15;
  const damping = options.damping ?? 0.8;
  const precision = options.precision ?? 0.001;

  const [current, setCurrent] = createSignal(target());
  let currentVal = target();
  let velocity = 0;
  let cancelId: number | null = null;

  function tick() {
    const dest = target();
    const force = (dest - currentVal) * stiffness;
    velocity = (velocity + force) * damping;
    currentVal += velocity;

    if (Math.abs(velocity) < precision && Math.abs(dest - currentVal) < precision) {
      currentVal = dest;
      velocity = 0;
      setCurrent(dest);
      cancelId = null;
      return;
    }

    setCurrent(currentVal);
    cancelId = requestAnimationFrame(tick);
  }

  createEffect(
    on(
      target,
      () => {
        if (cancelId === null) {
          cancelId = requestAnimationFrame(tick);
        }
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
