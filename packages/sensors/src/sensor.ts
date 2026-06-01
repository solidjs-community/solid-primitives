import { createSignal, onCleanup } from "solid-js";
import type { Accessor, SignalOptions } from "solid-js";
import { isServer } from "@solidjs/web";

const OWNED_WRITE: SignalOptions<unknown> = { ownedWrite: true };

/** Options shared by all Generic Sensor API primitives. */
export type SensorOptions = { frequency?: number };

/**
 * Minimal Generic Sensor API interface (not in the standard TypeScript DOM lib).
 * Extend this to type specific sensors passed to `makeSensor` / `createSensor`.
 */
export interface GenericSensor extends EventTarget {
  readonly activated: boolean;
  readonly hasReading: boolean;
  readonly timestamp: DOMHighResTimeStamp | undefined;
  start(): void;
  stop(): void;
}

/**
 * Sets up any Generic Sensor API sensor and calls `onChange` on each reading.
 * Returns a cleanup function, or `null` if the sensor constructor throws
 * (e.g. the API is unsupported or permission was denied).
 *
 * @param SensorClass Any Generic Sensor API constructor (Magnetometer, LinearAccelerationSensor, etc.)
 * @param onChange Called with the live sensor object on each reading event
 * @param options Optional `{ frequency }` passed to the sensor constructor
 * @returns Cleanup function that stops and removes the sensor, or `null` on failure
 */
export const makeSensor = <T extends GenericSensor>(
  SensorClass: { new (options?: any): T },
  onChange: (sensor: T) => void,
  options?: SensorOptions,
): VoidFunction | null => {
  let sensor: T;
  try {
    sensor = new SensorClass(options);
  } catch {
    return null;
  }
  const handleReading = () => onChange(sensor);
  sensor.addEventListener("reading", handleReading);
  sensor.start();
  return () => {
    sensor.removeEventListener("reading", handleReading);
    sensor.stop();
  };
};

/**
 * Creates a reactive accessor for any Generic Sensor API sensor.
 * The accessor re-fires on every reading event (even if the sensor object reference
 * is the same) because the underlying signal uses `equals: false`.
 * Returns `undefined` until the first reading or if the sensor is unavailable.
 * Returns a static `() => undefined` on the server.
 *
 * @param SensorClass Any Generic Sensor API constructor
 * @param options Optional `{ frequency }` passed to the sensor constructor
 * @returns Accessor yielding the live sensor object (updated on every reading), or `undefined`
 */
export const createSensor = <T extends GenericSensor>(
  SensorClass: { new (options?: any): T },
  options?: SensorOptions,
): Accessor<T | undefined> => {
  if (isServer) return () => undefined;
  const [sensor, setSensor] = createSignal<T | undefined>(undefined, {
    ...(OWNED_WRITE as SignalOptions<T | undefined>),
    equals: false,
  });
  const cleanup = makeSensor(SensorClass, s => setSensor(s as Exclude<T, Function>), options);
  if (cleanup) onCleanup(cleanup);
  return sensor;
};
