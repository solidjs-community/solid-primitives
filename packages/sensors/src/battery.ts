import { createSignal, onCleanup } from "solid-js";
import type { Accessor, SignalOptions } from "solid-js";
import { isServer } from "@solidjs/web";

const OWNED_WRITE: SignalOptions<unknown> = { ownedWrite: true };

export type BatteryReading = {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
};

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

/**
 * Subscribes to the Battery Status API and calls `onChange` with the current reading
 * immediately after the API resolves, then again on every battery change event.
 * Returns a synchronous cleanup function safe to pass to `onCleanup`.
 * Silently no-ops if `navigator.getBattery` is unavailable.
 *
 * @param onChange Called with the current BatteryReading on subscribe and on each change
 * @returns Synchronous cleanup function that removes all battery event listeners
 */
export const makeBattery = (onChange: (reading: BatteryReading) => void): VoidFunction => {
  let disposed = false;
  let removeFn: VoidFunction | undefined;

  if (typeof navigator !== "undefined" && "getBattery" in navigator) {
    (navigator as any).getBattery().then((battery: BatteryManager) => {
      if (disposed) return;
      const update = () =>
        onChange({
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
          level: battery.level,
        });
      update();
      const events = [
        "chargingchange",
        "chargingtimechange",
        "dischargingtimechange",
        "levelchange",
      ] as const;
      events.forEach(e => battery.addEventListener(e, update));
      removeFn = () => events.forEach(e => battery.removeEventListener(e, update));
    });
  }

  return () => {
    disposed = true;
    removeFn?.();
  };
};

/**
 * Creates a reactive accessor for battery status.
 * Starts as `undefined` until the Battery Status API resolves (async).
 * Returns a static `() => ({ charging: false, chargingTime: 0, dischargingTime: 0, level: 1 })`
 * on the server.
 * Registers cleanup with `onCleanup` when inside a reactive owner.
 *
 * @returns Accessor yielding the current BatteryReading, or `undefined` before the API resolves
 */
export const createBattery = (): Accessor<BatteryReading | undefined> => {
  if (isServer)
    return () => ({ charging: false, chargingTime: 0, dischargingTime: 0, level: 1 });
  const [reading, setReading] = createSignal<BatteryReading | undefined>(
    undefined,
    OWNED_WRITE as SignalOptions<BatteryReading | undefined>,
  );
  const cleanup = makeBattery(r => setReading(r as Exclude<BatteryReading, Function>));
  onCleanup(cleanup);
  return reading;
};
