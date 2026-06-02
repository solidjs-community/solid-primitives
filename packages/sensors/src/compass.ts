import { createSignal, onCleanup } from "solid-js";
import type { SignalOptions } from "solid-js";
import { isServer } from "@solidjs/web";
import { makeSensor } from "./sensor.js";
import type { GenericSensor } from "./sensor.js";

const OWNED_WRITE: SignalOptions<unknown> = { ownedWrite: true };

/** Options for `makeCompass` / `createCompass`. */
export type CompassOptions = {
  frequency?: number;
  referenceFrame?: "device" | "screen";
};

/** Raw magnetometer reading in microteslas (µT), as returned by `makeCompass` / `createCompass`. */
export type CompassReading = { x: number; y: number; z: number };

interface MagnetometerSensor extends GenericSensor {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

/**
 * Sets up a `Magnetometer` sensor and calls `onChange` with x/y/z readings in microteslas.
 * Uses the Generic Sensor API (`window.Magnetometer`).
 * Returns `null` if the Magnetometer API is unavailable or throws on construction.
 *
 * @param onChange Called on each reading with `{ x, y, z }` in microteslas (null coerced to 0)
 * @param options Optional `{ frequency, referenceFrame }` passed to the Magnetometer constructor
 * @returns Cleanup function that stops the sensor, or `null` if unsupported
 */
export const makeCompass = (
  onChange: (reading: CompassReading) => void,
  options?: CompassOptions,
): VoidFunction | null => {
  if (!("Magnetometer" in globalThis)) return null;
  return makeSensor<MagnetometerSensor>(
    (globalThis as any).Magnetometer,
    s => onChange({ x: s.x ?? 0, y: s.y ?? 0, z: s.z ?? 0 }),
    options,
  );
};

/**
 * Creates a reactive object with `x`, `y`, `z` magnetometer readings in microteslas.
 * All properties start at `0` and update on each sensor reading.
 * Returns a non-reactive `{ x: 0, y: 0, z: 0 }` on the server.
 * Registers cleanup with `onCleanup` when inside a reactive owner.
 *
 * @param options Optional `{ frequency, referenceFrame }` passed to the Magnetometer constructor
 * @returns Reactive CompassReading object `{ x, y, z }`
 */
export const createCompass = (options?: CompassOptions): CompassReading => {
  if (isServer) return { x: 0, y: 0, z: 0 };
  const [x, setX] = createSignal(0, OWNED_WRITE as SignalOptions<number>);
  const [y, setY] = createSignal(0, OWNED_WRITE as SignalOptions<number>);
  const [z, setZ] = createSignal(0, OWNED_WRITE as SignalOptions<number>);
  const cleanup = makeCompass(
    r => {
      setX(r.x);
      setY(r.y);
      setZ(r.z);
    },
    options,
  );
  if (cleanup) onCleanup(cleanup);
  return {
    get x() {
      return x();
    },
    get y() {
      return y();
    },
    get z() {
      return z();
    },
  };
};
