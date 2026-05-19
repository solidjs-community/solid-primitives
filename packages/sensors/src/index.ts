import { createSignal, onCleanup } from "solid-js";
import type { Accessor, SignalOptions } from "solid-js";

const OWNED_WRITE: SignalOptions<unknown> = { ownedWrite: true };
import { isServer } from "@solidjs/web";

export type AccelerometerReading = DeviceMotionEventAcceleration | null;

export type GyroscopeReading = { alpha: number; beta: number; gamma: number };

/**
 * Sets up a raw devicemotion event listener and returns a cleanup function.
 * No Solid lifecycle — suitable for use outside a reactive owner.
 *
 * @param onChange Called on each (throttled) motion event with the acceleration reading
 * @param options.includeGravity Use `accelerationIncludingGravity` instead of `acceleration`
 * @param options.interval Minimum milliseconds between onChange calls (default 100)
 * @returns Cleanup function that removes the event listener
 */
export const makeAccelerometer = (
  onChange: (acceleration: AccelerometerReading) => void,
  options: { includeGravity?: boolean; interval?: number } = {},
): VoidFunction => {
  const { includeGravity = false, interval = 100 } = options;
  let throttled = false;
  const handler = (e: DeviceMotionEvent) => {
    if (throttled) return;
    throttled = true;
    setTimeout(() => {
      throttled = false;
    }, interval);
    onChange(includeGravity ? e.accelerationIncludingGravity : e.acceleration);
  };
  addEventListener("devicemotion", handler);
  return () => removeEventListener("devicemotion", handler);
};

/**
 * Creates a reactive accessor for device acceleration data.
 * Starts as `undefined` until the first motion event arrives.
 * Registers cleanup with `onCleanup` when inside a reactive owner.
 *
 * @param includeGravity Use `accelerationIncludingGravity` instead of `acceleration` (default false)
 * @param interval Minimum milliseconds between updates (default 100)
 * @returns Accessor yielding the latest AccelerometerReading, or `undefined` before the first event
 */
export const createAccelerometer = (
  includeGravity = false,
  interval = 100,
): Accessor<AccelerometerReading | undefined> => {
  if (isServer) return () => ({ x: 0, y: 0, z: 0 });
  const [acceleration, setAcceleration] = createSignal<AccelerometerReading | undefined>(
    undefined,
    OWNED_WRITE as SignalOptions<AccelerometerReading | undefined>,
  );
  const cleanup = makeAccelerometer(
    acc => setAcceleration(acc as Exclude<AccelerometerReading | undefined, Function>),
    { includeGravity, interval },
  );
  onCleanup(cleanup);
  return acceleration;
};

/**
 * Sets up a raw deviceorientation event listener and returns a cleanup function.
 * No Solid lifecycle — suitable for use outside a reactive owner.
 *
 * @param onChange Called on each (throttled) orientation event with alpha/beta/gamma values
 * @param options.interval Minimum milliseconds between onChange calls (default 100)
 * @returns Cleanup function that removes the event listener
 */
export const makeGyroscope = (
  onChange: (orientation: GyroscopeReading) => void,
  options: { interval?: number } = {},
): VoidFunction => {
  const { interval = 100 } = options;
  let throttled = false;
  const handler = (e: DeviceOrientationEvent) => {
    if (throttled) return;
    throttled = true;
    setTimeout(() => {
      throttled = false;
    }, interval);
    onChange({
      alpha: e.alpha ?? 0,
      beta: e.beta ?? 0,
      gamma: e.gamma ?? 0,
    });
  };
  addEventListener("deviceorientation", handler);
  return () => removeEventListener("deviceorientation", handler);
};

/**
 * Creates a reactive object tracking device orientation (gyroscope data).
 * Returns an object with reactive `alpha`, `beta`, and `gamma` properties.
 * Registers cleanup with `onCleanup` when inside a reactive owner.
 *
 * @param interval Minimum milliseconds between updates (default 100)
 * @returns Reactive GyroscopeReading object `{ alpha, beta, gamma }`
 */
export const createGyroscope = (interval = 100): GyroscopeReading => {
  if (isServer) return { alpha: 0, beta: 0, gamma: 0 };
  const [alpha, setAlpha] = createSignal(0, OWNED_WRITE as SignalOptions<number>);
  const [beta, setBeta] = createSignal(0, OWNED_WRITE as SignalOptions<number>);
  const [gamma, setGamma] = createSignal(0, OWNED_WRITE as SignalOptions<number>);
  const cleanup = makeGyroscope(
    o => {
      setAlpha(o.alpha);
      setBeta(o.beta);
      setGamma(o.gamma);
    },
    { interval },
  );
  onCleanup(cleanup);
  return {
    get alpha() {
      return alpha();
    },
    get beta() {
      return beta();
    },
    get gamma() {
      return gamma();
    },
  };
};
