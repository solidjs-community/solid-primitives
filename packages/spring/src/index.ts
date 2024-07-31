import { isServer } from "solid-js/web";

// ===========================================================================
// Internals
// ===========================================================================

// src/internal/client/types.d.ts

type Task = {
  abort(): void;
  promise: Promise<void>;
};

type TickContext<T extends SpringTarget> = {
  inv_mass: number;
  dt: number;
  opts: SpringOptions & { set: SpringSetter<T> };
  settled: boolean;
};

type Raf = {
  /** Alias for `requestAnimationFrame`, exposed in such a way that we can override in tests */
  tick: (callback: (time: DOMHighResTimeStamp) => void) => any;
  /** Alias for `performance.now()`, exposed in such a way that we can override in tests */
  now: () => number;
  /** A set of tasks that will run to completion, unless aborted */
  tasks: Set<TaskEntry>;
};

type TaskCallback = (now: number) => boolean | void;

type TaskEntry = { c: TaskCallback; f: () => void };

// src/internal/client/timing.js

/** SSR-safe RAF function. */
const request_animation_frame = isServer ? () => {} : requestAnimationFrame;

/** SSR-safe now getter. */
const now = isServer ? () => Date.now() : () => performance.now();

const raf: Raf = {
  tick: (_: any) => request_animation_frame(_),
  now: () => now(),
  tasks: new Set(),
};

// src/motion/utils.js

/**
 * @param {any} obj
 * @returns {obj is Date}
 */
function is_date(obj: any): obj is Date {
  return Object.prototype.toString.call(obj) === "[object Date]";
}

// src/internal/client/loop.js

/**
 * @param {number} now
 * @returns {void}
 */
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

import { Accessor, createEffect, createSignal, on } from "solid-js";

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

export type SpringTargetPrimitive = number | Date;
export type SpringTarget =
  | SpringTargetPrimitive
  | { [key: string]: SpringTargetPrimitive | SpringTarget }
  | SpringTargetPrimitive[]
  | SpringTarget[];

/**
 * "Widen" Utility Type so that number types are not converted to
 * literal types when passed to `createSpring`.
 *
 * e.g. createSpring(0) returns `0`, not `number`.
 */
export type WidenSpringTarget<T> = T extends number ? number : T extends Date ? Date : T;

export type SpringSetter<T> = (
  newValue: T,
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
  const [springValue, setSpringValue] = createSignal<T>(initialValue);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = options;

  const [lastTime, setLastTime] = createSignal<number>(0);

  const [task, setTask] = createSignal<Task | null>(null);

  const [current_token, setCurrentToken] = createSignal<object>();

  const [lastValue, setLastValue] = createSignal<T>(initialValue);
  const [targetValue, setTargetValue] = createSignal<T | undefined>();

  const [inv_mass, setInvMass] = createSignal<number>(1);
  const [inv_mass_recovery_rate, setInvMassRecoveryRate] = createSignal<number>(0);
  const [cancelTask, setCancelTask] = createSignal<boolean>(false);

  const set: SpringSetter<T> = (newValue, opts = {}) => {
    setTargetValue(_ => newValue);

    const token = current_token() ?? {};
    setCurrentToken(token);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (springValue() == null || opts.hard || (stiffness >= 1 && damping >= 1)) {
      setCancelTask(true);
      setLastTime(raf.now());
      setLastValue(_ => newValue);
      setSpringValue(_ => newValue);
      return Promise.resolve();
    } else if (opts.soft) {
      const rate = opts.soft === true ? 0.5 : +opts.soft;
      setInvMassRecoveryRate(1 / (rate * 60));
      setInvMass(0); // Infinite mass, unaffected by spring forces.
    }
    if (!task()) {
      setLastTime(raf.now());
      setCancelTask(false);

      const _loop = loop(now => {
        if (cancelTask()) {
          setCancelTask(false);
          setTask(null);
          return false;
        }

        setInvMass(_inv_mass => Math.min(_inv_mass + inv_mass_recovery_rate(), 1));

        const ctx: TickContext<T> = {
          inv_mass: inv_mass(),
          opts: {
            set: set,
            damping: damping,
            precision: precision,
            stiffness: stiffness,
          },
          settled: true,
          dt: ((now - lastTime()) * 60) / 1000,
        };
        // @ts-ignore
        const next_value = tick_spring(
          ctx,
          lastValue(),
          springValue(),
          // @ts-ignore
          targetValue(),
        );
        setLastTime(now);
        setLastValue(_ => springValue());
        setSpringValue(_ => next_value);
        if (ctx.settled) {
          setTask(null);
        }

        return !ctx.settled;
      });

      setTask(_loop);
    }
    return new Promise<void>(fulfil => {
      task()?.promise.then(() => {
        if (token === current_token()) fulfil();
      });
    });
  };

  const tick_spring = <T extends SpringTarget>(
    ctx: TickContext<T>,
    last_value: T,
    current_value: T,
    target_value: T,
  ): T => {
    if (typeof current_value === "number" || is_date(current_value)) {
      // @ts-ignore
      const delta = target_value - current_value;
      // @ts-ignore
      const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
      const spring = ctx.opts.stiffness! * delta;
      const damper = ctx.opts.damping! * velocity;
      const acceleration = (spring - damper) * ctx.inv_mass;
      const d = (velocity + acceleration) * ctx.dt;
      if (Math.abs(d) < ctx.opts.precision! && Math.abs(delta) < ctx.opts.precision!) {
        return target_value; // settled
      } else {
        ctx.settled = false; // signal loop to keep ticking
        // @ts-ignore
        return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
      }
    } else if (Array.isArray(current_value)) {
      // @ts-ignore
      return current_value.map((_, i) =>
        // @ts-ignore
        tick_spring(ctx, last_value[i], current_value[i], target_value[i]),
      );
    } else if (typeof current_value === "object") {
      const next_value = {};
      for (const k in current_value) {
        // @ts-ignore
        next_value[k] = tick_spring(
          ctx,
          // @ts-ignore
          last_value[k],
          current_value[k],
          target_value[k],
        );
      }
      // @ts-ignore
      return next_value;
    } else {
      throw new Error(`Cannot spring ${typeof current_value} values`);
    }
  };

  return [springValue as Accessor<WidenSpringTarget<T>>, set as SpringSetter<WidenSpringTarget<T>>];
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

  createEffect(
    on(
      () => target(),
      () => {
        setSpringValue(target() as WidenSpringTarget<T>);
      },
    ),
  );

  return springValue;
}
