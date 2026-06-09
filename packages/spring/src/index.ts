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
 *
 * **Important**: array length and object key sets must remain stable across updates.
 * Changing structure (adding/removing keys or changing array length) will produce
 * `NaN` values in the animated output.
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
   *
   * Note: when applied to an already-running animation, the inverse-mass is reset
   * to 0, briefly removing spring force before recovering. This prevents a jarring
   * velocity kick on interruption.
   */
  soft?: boolean | number;
};

/**
 * Setter returned by {@link createSpring} and {@link makeSpring}.
 * Drives the spring toward a new target value.
 *
 * @param newValue - The target value, or a function `(prev) => next` that derives it
 *   from the current animated value.
 * @param opts - Optional {@link SpringSetterOptions} controlling snap (`hard`) or
 *   soft-launch (`soft`) behaviour.
 * @returns A Promise that resolves when the spring settles at the target.
 *   If a new `set()` is called before the spring settles, all pending Promises
 *   resolve together once the animation finishes — none are orphaned.
 *   Resolves immediately with `hard: true` or when both stiffness and damping are ≥ 1.
 *   Resolves when `onCleanup` fires (component unmounts). Never resolves during SSR.
 */
export type SpringSetter<T> = (
  newValue: T | ((prev: T) => T),
  opts?: SpringSetterOptions,
) => Promise<void>;

/** Extra reactive state exposed alongside the spring value and setter. */
export type SpringExtras = {
  /** `true` while the spring is animating toward its target value. */
  isAnimating: Accessor<boolean>;
};

/**
 * Non-reactive base primitive. Creates a spring-physics animator without
 * integrating with Solid's reactive lifecycle — you are responsible for
 * calling `cleanup()` when finished.
 *
 * Useful outside component trees: in stores, workers, or custom ownership roots.
 * Prefer {@link createSpring} inside components and reactive contexts.
 *
 * @param initialValue - Starting value of the spring.
 * @param options - Physics parameters, or a reactive accessor that returns them.
 *   Pass `() => springOpts` to change `stiffness`, `damping`, or `precision`
 *   dynamically (e.g. to respect `prefers-reduced-motion`).
 * @returns A 4-tuple `[value, set, extras, cleanup]`:
 *   - `value` — reactive accessor for the current animated value
 *   - `set` — {@link SpringSetter} that drives the spring toward a new target
 *   - `extras` — `{ isAnimating }` accessor
 *   - `cleanup` — call this to cancel any in-flight animation and release resources
 *
 * @example
 * const [value, setValue, { isAnimating }, cleanup] = makeSpring(0);
 * setValue(100);
 * // later…
 * cleanup();
 */
export function makeSpring<T extends SpringTarget>(
  initialValue: T,
  options: SpringOptions | Accessor<SpringOptions> = {},
): [
  Accessor<WidenSpringTarget<T>>,
  SpringSetter<WidenSpringTarget<T>>,
  SpringExtras,
  cleanup: () => void,
] {
  const getOptions: () => SpringOptions =
    typeof options === "function"
      ? (options as Accessor<SpringOptions>)
      : () => options as SpringOptions;

  const [signal, setSignal] = createSignal(initialValue as Exclude<T, Function>, {
    ownedWrite: true,
  });
  const [animating, setAnimating] = createSignal(false, { ownedWrite: true });

  let value_current: any = initialValue;
  let value_last: any = initialValue;
  let value_target: any = initialValue;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let raf_id = 0;
  let settled = true;
  let time_last = 0;
  let time_delta = 0;
  let resolvers: (() => void)[] = [];

  const stopAnimation = () => {
    cancelAnimationFrame(raf_id);
    raf_id = 0;
    setAnimating(false);
    const rs = resolvers;
    resolvers = [];
    rs.forEach(r => r());
  };

  function tick(last: any, current: any, target: any, stiffness: number, damping: number, precision: number): any {
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
      return current.map((_, i) =>
        tick(last[i], current[i], target[i], stiffness, damping, precision),
      );
    }

    if (typeof current === "object") {
      const next = { ...current };
      for (const k in current) {
        next[k] = tick(last[k], current[k], target[k], stiffness, damping, precision);
      }
      return next;
    }

    throw new Error(`Cannot spring ${typeof current} values`);
  }

  const frame: FrameRequestCallback = time => {
    const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = getOptions();

    time_delta = Math.max(1 / 60, ((time - time_last) * 60) / 1000); // guard against d<=0
    time_last = time;

    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
    settled = true;

    const new_value = tick(value_last, value_current, value_target, stiffness, damping, precision);
    value_last = value_current;
    setSignal((value_current = new_value));

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (settled) {
      stopAnimation();
    } else {
      raf_id = requestAnimationFrame(frame);
    }
  };

  const set: SpringSetter<any> = (param, opts = {}) => {
    value_target = typeof param === "function" ? param(value_current) : param;

    const { stiffness = 0.15, damping = 0.8 } = getOptions();

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
      setAnimating(true);
      raf_id = requestAnimationFrame(frame);
    }

    return new Promise<void>(r => resolvers.push(r));
  };

  return [signal as any, set, { isAnimating: animating }, stopAnimation];
}

/**
 * Creates a reactive spring-physics value. Instead of jumping to the next value
 * instantly, the signal animates toward it with a bouncy, spring-like motion
 * governed by `stiffness`, `damping`, and `precision`.
 *
 * Interpolates `number`, `Date`, flat arrays, and nested objects of those types.
 * Array length and object key sets must remain stable across `set()` calls.
 *
 * @template T - Must satisfy {@link SpringTarget} (number, Date, array, or plain object).
 * @param initialValue - The starting value of the spring.
 * @param options - Physics parameters, or a reactive accessor that returns them.
 *   Pass `() => springOpts` to change `stiffness`, `damping`, or `precision`
 *   dynamically (e.g. to respect `prefers-reduced-motion`):
 *   ```ts
 *   const reduced = createMediaQuery("(prefers-reduced-motion: reduce)");
 *   const [value, setValue] = createSpring(0, () => ({
 *     stiffness: reduced() ? 1 : 0.15,
 *     damping:   reduced() ? 1 : 0.8,
 *   }));
 *   ```
 * @returns A 3-tuple `[value, set, extras]`:
 *   - `value` — reactive accessor for the current animated value
 *   - `set` — {@link SpringSetter} that drives the spring toward a new target
 *   - `extras` — `{ isAnimating }` reactive boolean accessor
 *
 * @example
 * // Animate a number
 * const [progress, setProgress, { isAnimating }] = createSpring(0, { stiffness: 0.15, damping: 0.8 });
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
 * // Await settlement — resolves when settled or when unmounted
 * await setProgress(100);
 * console.log("animation complete");
 */
export function createSpring<T extends SpringTarget>(
  initialValue: T,
  options: SpringOptions | Accessor<SpringOptions> = {},
): [Accessor<WidenSpringTarget<T>>, SpringSetter<WidenSpringTarget<T>>, SpringExtras] {
  if (isServer) {
    const getOptions: () => SpringOptions =
      typeof options === "function"
        ? (options as Accessor<SpringOptions>)
        : () => options as SpringOptions;

    const [signal, setSignal] = createSignal(initialValue as Exclude<T, Function>, {
      ownedWrite: true,
    });
    let value_current: any = initialValue;

    const setter: SpringSetter<any> = (param, opts = {}) => {
      const { stiffness = 0.15, damping = 0.8 } = getOptions();
      if (opts.hard || (stiffness >= 1 && damping >= 1)) {
        value_current = typeof param === "function" ? param(value_current) : param;
        setSignal(_ => value_current);
        return Promise.resolve();
      }
      return new Promise<void>(() => {});
    };

    return [signal as any, setter, { isAnimating: () => false }];
  }

  const [value, set, extras, cleanup] = makeSpring(initialValue, options);
  onCleanup(cleanup);
  return [value, set, extras];
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
 * @param options - Physics parameters, or a reactive accessor that returns them.
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
  options?: SpringOptions | Accessor<SpringOptions>,
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
