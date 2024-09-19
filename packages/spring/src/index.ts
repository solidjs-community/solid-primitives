import { isServer } from "solid-js/web";

// ===========================================================================
// Internals
// ===========================================================================

// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/internal/client/types.d.ts

type Task = {
  abort(): void;
  promise: Promise<void>;
};

type TickContext = {
  inv_mass: number;
  dt: number;
  settled: boolean;
};

type TaskCallback = (now: number) => boolean | void;

type TaskEntry = { c: TaskCallback; f: () => void };

// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/internal/client/timing.js

const raf: {
  /** Alias for `requestAnimationFrame`, exposed in such a way that we can override in tests */
  tick: (callback: (time: DOMHighResTimeStamp) => void) => any;
  /** Alias for `performance.now()`, exposed in such a way that we can override in tests */
  now: () => number;
  /** A set of tasks that will run to completion, unless aborted */
  tasks: Set<TaskEntry>;
} = {
  tick: (_: any) => (isServer ? () => {} : requestAnimationFrame(_)), // SSR-safe RAF function.
  now: () => performance.now(), // Getter for now() using performance in browser and Date in server. Although both are available in node and browser.
  tasks: new Set(),
};

// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/motion/utils.js

function is_date(obj: any): obj is Date {
  return Object.prototype.toString.call(obj) === "[object Date]";
}

// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/internal/client/loop.js

function run_tasks(now: number) {
  raf.tasks.forEach(task => {
    if (!task.c(now)) {
      raf.tasks.delete(task);
      task.f();
    }
  });

  if (raf.tasks.size !== 0) {
    raf.tick(run_tasks);
  }
}

/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback: TaskCallback): Task {
  let task: TaskEntry;

  if (raf.tasks.size === 0) {
    raf.tick(run_tasks);
  }

  return {
    promise: new Promise((fulfill: any) => {
      raf.tasks.add((task = { c: callback, f: fulfill }));
    }),
    abort() {
      raf.tasks.delete(task);
    },
  };
}

// ===========================================================================
// createSpring hook
// ===========================================================================

import { Accessor, createEffect, createSignal, untrack } from "solid-js";

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
  | (number | Date)[]
  | SpringTarget[];

/**
 * "Widen" Utility Type so that number types are not converted to
 * literal types when passed to `createSpring`.
 *
 * e.g. createSpring(0) returns `0`, not `number`.
 */
export type WidenSpringTarget<T> = T extends number ? number : T;

export type SpringSetter<T> = (
  newValue: T | ((prev: T) => T),
  opts?: { hard?: boolean; soft?: boolean | number },
) => Promise<void>;

/**
 * Creates a signal and a setter that uses spring physics when interpolating from
 * one value to another. This means when the value changes, instead of
 * transitioning at a steady rate, it "bounces" like a spring would,
 * depending on the physics paramters provided. This adds a level of realism to
 * the transitions and can enhance the user experience.
 *
 * `T` - The type of the signal. It works for the basic data types that can be
 * interpolated: `number`, a `Date`, `Array<T>` or a nested object of T.
 *
 * @param initialValue The initial value of the signal.
 * @param options Options to configure the physics of the spring.
 * @returns Returns the spring value and a setter.
 *
 * @example
 * const [progress, setProgress] = createSpring(0, { stiffness: 0.15, damping: 0.8 });
 */
export function createSpring<T extends SpringTarget>(
  initialValue: T,
  options: SpringOptions = {},
): [Accessor<WidenSpringTarget<T>>, SpringSetter<WidenSpringTarget<T>>] {
  const [springValue, setSpringValue] = createSignal(initialValue);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = options;

  let last_time = 0;
  let task: Task | null = null;
  let current_token: object | undefined = undefined;
  let current_value = initialValue
  let last_value = initialValue;
  let target_value = initialValue;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let cancel_task = false;

  const set: SpringSetter<T> = (param, opts = {}) => {
    target_value = typeof param === "function" ? param(current_value) : param;

    const token = current_token ?? {};
    current_token = token;

    if (current_value == null || opts.hard || (stiffness >= 1 && damping >= 1)) {
      cancel_task = true;
      last_time = raf.now();
      setSpringValue(_ => current_value = last_value = target_value);
      return Promise.resolve();
    } else if (opts.soft) {
      const rate = opts.soft === true ? 0.5 : +opts.soft;
      inv_mass_recovery_rate = 1 / (rate * 60);
      inv_mass = 0; // Infinite mass, unaffected by spring forces.
    }
    if (!task) {
      last_time = raf.now();
      cancel_task = false;

      const _loop = loop(now => {
        if (cancel_task) {
          cancel_task = false;
          task = null;
          return false;
        }

        inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);

        const ctx: TickContext = {
          inv_mass: inv_mass,
          settled: true,
          dt: ((now - last_time) * 60) / 1000,
        };
        let new_value = tick_spring(ctx, last_value, current_value, target_value)
        last_time = now;
        last_value = current_value;
        setSpringValue(current_value = new_value);
        if (ctx.settled) {
          task = null;
        }

        return !ctx.settled;
      });

      task = _loop;
    }
    return new Promise<void>(fulfil => {
      task?.promise.then(() => {
        if (token === current_token) fulfil();
      });
    });
  };

  const tick_spring = (
    ctx: TickContext,
    last_value: T,
    current_value: T,
    target_value: T,
  ): any => {
    if (typeof current_value === "number" || is_date(current_value)) {
      const delta = +target_value - +current_value;
      const velocity = (+current_value - +last_value) / (ctx.dt || 1 / 60); // guard div by 0
      const spring = stiffness * delta;
      const damper = damping * velocity;
      const acceleration = (spring - damper) * ctx.inv_mass;
      const d = (velocity + acceleration) * ctx.dt;
      if (Math.abs(d) < precision && Math.abs(delta) < precision) {
        return target_value; // settled
      }
      ctx.settled = false; // signal loop to keep ticking
      return typeof current_value === "number" ? current_value + d : new Date(+current_value + d);
    }
    if (Array.isArray(current_value)) {
      return current_value.map((_, i) =>
        // @ts-expect-error
        tick_spring(ctx, last_value[i], current_value[i], target_value[i]),
      );
    }
    if (typeof current_value === "object") {
      const next_value = {...current_value};
      for (const k in current_value) {
        // @ts-expect-error
        next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
      }
      return next_value;
    }
    throw new Error(`Cannot spring ${typeof current_value} values`);
  };

  return [
    springValue as Accessor<WidenSpringTarget<T>>,
    set as unknown as SpringSetter<WidenSpringTarget<T>>,
  ];
}

// ===========================================================================
// createDerivedSpring hook
// ===========================================================================

/**
 * Creates a spring value that interpolates based on changes on a passed signal.
 * Works similar to the `@solid-primitives/tween`
 *
 * @param target Target to be modified.
 * @param options Options to configure the physics of the spring.
 * @returns Returns the spring value only.
 *
 * @example
 * const percent = createMemo(() => current() / total() * 100);
 *
 * const springedPercent = createDerivedSignal(percent, { stiffness: 0.15, damping: 0.8 });
 */
export function createDerivedSpring<T extends SpringTarget>(
  target: Accessor<T>,
  options?: SpringOptions,
) {
  const [springValue, setSpringValue] = createSpring(target(), options);

  createEffect(() => setSpringValue(target() as WidenSpringTarget<T>));

  return springValue;
}
