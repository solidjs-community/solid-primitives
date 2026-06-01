import { createSignal, onCleanup } from "solid-js";
import type { Accessor, SignalOptions } from "solid-js";
import { isServer } from "@solidjs/web";

const OWNED_WRITE: SignalOptions<unknown> = { ownedWrite: true };

export type AccelerometerReading = DeviceMotionEventAcceleration | null;

/**
 * Sets up a raw `devicemotion` event listener and returns a cleanup function.
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
