import { createSignal, createEffect, onCleanup, on, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface SpringOptions {
  /**
   * Spring stiffness coefficient (0.01 - 1.0).
   * @default 0.15
   */
  stiffness?: number;
  /**
   * Spring damping coefficient (0.1 - 1.0).
   * @default 0.8
   */
  damping?: number;
  /**
   * Velocity threshold below which the spring settles and halts the RAF loop.
   * @default 0.001
   */
  precision?: number;
}

/**
 * Creates a reactive numeric spring physics animation accessor.
 * Automatically halts the RAF loop when velocity and distance fall below precision threshold.
 *
 * @param target Accessor providing target numeric position.
 * @param options Stiffness, damping, and precision configurations.
 *
 * @example
 * ```ts
 * const [x, setX] = createSignal(0);
 * const springX = createSpringTween(x, { stiffness: 0.2, damping: 0.75 });
 * ```
 */
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
