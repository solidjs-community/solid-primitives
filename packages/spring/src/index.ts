import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";

// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/motion/utils.js

function is_date(obj: any): obj is Date {
  return Object.prototype.toString.call(obj) === "[object Date]";
}

export type SpringOptions = {
  /**
   * Stiffness of the spring. Higher values create more sudden movement.
   * @default 0.15
   */
  stiffness?: number;
  /**
   * Strength of the opposing (damping) force. Lower values produce a springier,
   * more oscillating motion. Set to `0` for infinite oscillation.
   * @default 0.8
   */
  damping?: number;
  /**
   * Minimum displacement below which the animation is considered settled.
   * Smaller values require the animated value to get closer to the target before
   * stopping — resulting in a longer, more precise animation.
   *
   * @example
   * // Stops when within 0.5 of the target (coarse, short animation)
   * { precision: 0.5 }
   * // Stops when within 0.001 of the target (fine, longer animation)
   * { precision: 0.001 }
   *
   * @default 0.01
   */
  precision?: number;
};

/**
 * Value types that can be spring-interpolated: a scalar number, a Date,
 * an object with numeric/Date values, or an array of those types (including
 * nested arrays and objects).
 */
export type SpringTarget =
  | number
  | Date
  | { [key: string]: number | Date | SpringTarget }
  | readonly (number | Date)[]
  | readonly SpringTarget[];

/**
 * Widens a literal numeric type to `number` so that inferring from a literal
 * (e.g. `createSpring(0)`) does not lock the signal to the literal type `0`.
 */
export type WidenSpringTarget<T> = T extends number ? number : T;

export type SpringSetterOptions = {
  /**
   * When `true`, skips the animation and snaps immediately to the target value.
   * The returned Promise resolves right away.
   */
  hard?: boolean;
  /**
   * Starts the animation with temporarily reduced stiffness, producing a
   * softer launch before the spring regains full force.
   *
   * - `true` — use a default soft duration (~0.5 s)
   * - `number` — number of seconds over which full stiffness is recovered
   */
  soft?: boolean | number;
};

/**
 * Setter returned by {@link createSpring}. Drives the spring toward a new target value.
 *
 * @param newValue - The target value, or a function `(prev) => next` that derives it
 *   from the current animated value.
 * @param opts - Optional {@link SpringSetterOptions} controlling snap (`hard`) or
 *   soft-launch (`soft`) behaviour.
 * @returns A Promise that resolves when the spring settles at the target.
 *   Resolves immediately with `hard: true` or when both stiffness and damping are ≥ 1.
 *   Resolves when `onCleanup` fires (component unmounts). Never resolves during SSR.
 */
export type SpringSetter<T> = (
  newValue: T | ((prev: T) => T),
  opts?: SpringSetterOptions,
) => Promise<void>;

/**
 * Creates a reactive spring-physics value. Instead of jumping to the next value
 * instantly, the signal animates toward it with a bouncy, spring-like motion
 * governed by `stiffness`, `damping`, and `precision`.
 *
 * Interpolates `number`, `Date`, flat arrays, and nested objects of those types.
 *
 * @template T - Must satisfy {@link SpringTarget} (number, Date, array, or plain object).
 * @param initialValue - The starting value of the spring.
 * @param options - Physics parameters. See {@link SpringOptions}.
 * @returns A tuple `[value, set]`:
 *   - `value` — reactive accessor for the current animated value
 *   - `set` — {@link SpringSetter} that drives the spring toward a new target
 *
 * @example
 * // Animate a number
 * const [progress, setProgress] = createSpring(0, { stiffness: 0.15, damping: 0.8 });
 * setProgress(100); // animates from 0 → 100
 *
 * @example
 * // Snap immediately
 * setProgress(100, { hard: true });
 *
 * @example
 * // Animate a plain object
 * const [xy, setXY] = createSpring({ x: 0, y: 0 }, { stiffness: 0.08, damping: 0.2 });
 * setXY({ x: 200, y: 150 });
 *
 * @example
 * // Await settlement
 * await setProgress(100);
 * console.log("animation complete");
 */
export function createSpring<T extends SpringTarget>(
  initialValue: T,
  options: SpringOptions = {},
): [Accessor<WidenSpringTarget<T>>, SpringSetter<WidenSpringTarget<T>>] {
  const [signal, setSignal] = createSignal(initialValue as Exclude<T, Function>, { ownedWrite: true });
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = options;

  if (isServer) {
    return [
      signal as any,
      ((param: any, opts: SpringSetterOptions = {}) => {
        if (opts.hard || (stiffness >= 1 && damping >= 1)) {
          setSignal(param);
          return Promise.resolve();
        }
        return new Promise(() => {});
      }) as any,
    ];
  }

  let value_current = initialValue;
  let value_last = initialValue;
  let value_target = initialValue;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let raf_id = 0;
  let settled = true;
  let time_last = 0;
  let time_delta = 0;
  let resolve = () => {};

  const stopAnimation = () => {
    cancelAnimationFrame(raf_id);
    raf_id = 0;
    resolve();
  };
  onCleanup(stopAnimation);

  const frame: FrameRequestCallback = time => {
    time_delta = Math.max(1 / 60, ((time - time_last) * 60) / 1000); // guard against d<=0
    time_last = time;

    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
    settled = true;

    const new_value = tick(value_last, value_current, value_target);
    value_last = value_current;
    setSignal((value_current = new_value));

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (settled) {
      stopAnimation();
    } else {
      raf_id = requestAnimationFrame(frame);
    }
  };

  const set: SpringSetter<T> = (param, opts = {}) => {
    value_target = typeof param === "function" ? param(value_current) : param;

    if (opts.hard || (stiffness >= 1 && damping >= 1)) {
      stopAnimation();
      setSignal(_ => (value_current = value_last = value_target));
      return Promise.resolve();
    }

    if (opts.soft) {
      inv_mass_recovery_rate = 1 / (typeof opts.soft === "number" ? opts.soft * 60 : 30);
      inv_mass = 0; // infinite mass: initial motion is unaffected by spring forces
    }

    if (raf_id === 0) {
      time_last = performance.now();
      raf_id = requestAnimationFrame(frame);
    }

    return new Promise<void>(r => (resolve = r));
  };

  const tick = (last: T, current: T, target: T): any => {
    if (typeof current === "number" || is_date(current)) {
      const delta = +target - +current;
      const velocity = (+current - +last) / time_delta;
      const spring = stiffness * delta;
      const damper = damping * velocity;
      const acceleration = (spring - damper) * inv_mass;
      const d = (velocity + acceleration) * time_delta;

      if (Math.abs(d) < precision && Math.abs(delta) < precision) {
        return target; // settled
      }

      settled = false; // keep the RAF loop running
      return typeof current === "number" ? current + d : new Date(+current + d);
    }

    if (Array.isArray(current)) {
      // @ts-expect-error
      return current.map((_, i) => tick(last[i], current[i], target[i]));
    }

    if (typeof current === "object") {
      const next = { ...current };
      for (const k in current) {
        // @ts-expect-error
        next[k] = tick(last[k], current[k], target[k]);
      }
      return next;
    }

    throw new Error(`Cannot spring ${typeof current} values`);
  };

  return [signal as any, set as any];
}

/**
 * A read-only spring that tracks an accessor. Whenever the source signal
 * changes, the spring animates toward the new value automatically.
 *
 * Equivalent to creating a {@link createSpring} and wiring it to an existing
 * signal with an effect — useful when you don't need to drive the animation
 * manually.
 *
 * @template T - Must satisfy {@link SpringTarget}.
 * @param target - Accessor whose value the spring follows.
 * @param options - Physics parameters. See {@link SpringOptions}.
 * @returns A reactive accessor for the current animated value.
 *
 * @example
 * const percent = createMemo(() => (current() / total()) * 100);
 * const springPercent = createDerivedSpring(percent, { stiffness: 0.15, damping: 0.8 });
 *
 * @example
 * // Works with any signal
 * const [count, setCount] = createSignal(0);
 * const springCount = createDerivedSpring(count);
 */
export function createDerivedSpring<T extends SpringTarget>(
  target: Accessor<T>,
  options?: SpringOptions,
) {
  const [springValue, setSpringValue] = createSpring(target(), options);

  if (!isServer) {
    createEffect(
      () => target(),
      value => {
        setSpringValue(value as WidenSpringTarget<T>);
      },
      { defer: true },
    );
  }

  return springValue;
}
