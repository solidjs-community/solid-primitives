import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/motion/utils.js

function is_date(obj: any): obj is Date {
  return Object.prototype.toString.call(obj) === "[object Date]";
}

// ===========================================================================
// createSpring hook
// ===========================================================================

export type SpringOptions = {
  /**
   * Stiffness of the spring. Higher values will create more sudden movement.
   * @default 0.15
   */
  stiffness?: number;
  /**
   * Strength of opposing force. If set to 0, spring will oscillate indefinitely.
   * @default 0.8
   */
  damping?: number;
  /**
   * Precision is the threshold relative to the target value at which the
   * animation will stop based on the current value.
   *
   * From 0, if the target value is 500, and the precision is 500, it will stop
   * the animation instantly (no animation, similar to `hard: true`).
   *
   * From 0, if the target value is 500, and the precision is 0.01, it will stop the
   * animation when the current value reaches 499.99 or 500.01 (longer animation).
   *
   * @default 0.01
   */
  precision?: number;
};

export type SpringTarget =
  | number
  | Date
  | { [key: string]: number | Date | SpringTarget }
  | readonly (number | Date)[]
  | readonly SpringTarget[];

/**
 * "Widen" Utility Type so that number types are not converted to
 * literal types when passed to `createSpring`.
 *
 * e.g. createSpring(0) returns `0`, not `number`.
 */
export type WidenSpringTarget<T> = T extends number ? number : T;

export type SpringSetterOptions = { hard?: boolean; soft?: boolean | number };
export type SpringSetter<T> = (
  newValue: T | ((prev: T) => T),
  opts?: SpringSetterOptions,
) => Promise<void>;

/**
 * Creates a signal and a setter that uses spring physics when interpolating from
 * one value to another. This means when the value changes, instead of
 * transitioning at a steady rate, it "bounces" like a spring would,
 * depending on the physics parameters provided. This adds a level of realism to
 * the transitions and can enhance the user experience.
 *
 * `T` - The type of the signal. It works for the basic data types that can be
 * interpolated: `number`, a `Date`, `Array<T>` or a nested object of T.
 *
 * @param initialValue The initial value of the signal.
 * @param options Options to configure the physics of the spring.
 * @returns Returns the spring value and a setter.
 * The setter optionally accepts options object of type `{ ?hard: boolean; soft?: boolean | number }`
 *
 * @example
 * const [progress, setProgress] = createSpring(0, { stiffness: 0.15, damping: 0.8 });
 */
export function createSpring<T extends SpringTarget>(
  initialValue: T,
  options: SpringOptions = {},
): [Accessor<WidenSpringTarget<T>>, SpringSetter<WidenSpringTarget<T>>] {
  const [signal, setSignal] = createSignal(initialValue);
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

  const cleanup = onCleanup(() => {
    cancelAnimationFrame(raf_id);
    raf_id = 0;
    resolve();
  });

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
      cleanup();
    } else {
      raf_id = requestAnimationFrame(frame);
    }
  };

  const set: SpringSetter<T> = (param, opts = {}) => {
    value_target = typeof param === "function" ? param(value_current) : param;

    if (opts.hard || (stiffness >= 1 && damping >= 1)) {
      cleanup();
      setSignal(_ => (value_current = value_last = value_target));
      return Promise.resolve();
    }

    if (opts.soft) {
      inv_mass_recovery_rate = 1 / (typeof opts.soft === "number" ? opts.soft * 60 : 30);
      inv_mass = 0; // Infinite mass, unaffected by spring forces.
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

      settled = false; // signal loop to keep ticking
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

// ===========================================================================
// createDerivedSpring hook
// ===========================================================================

/**
 * Creates a spring value that interpolates based on changes to the passed signal.
 * Works similar to the `@solid-primitives/tween`
 *
 * @param target Target to be modified.
 * @param options Options to configure the physics of the spring.
 * @returns Returns the spring value accessor only.
 *
 * @example
 * const percent = createMemo(() => current() / total() * 100);
 *
 * const springedPercent = createDerivedSpring(percent, { stiffness: 0.15, damping: 0.8 });
 */
export function createDerivedSpring<T extends SpringTarget>(
  target: Accessor<T>,
  options?: SpringOptions,
) {
  const [springValue, setSpringValue] = createSpring(target(), options);

  createEffect(() => setSpringValue(target() as WidenSpringTarget<T>));

  return springValue;
}
