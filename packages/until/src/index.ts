import { createSubRoot, raceTimeout, Truthy } from "@solid-primitives/utils";
import { Accessor, createComputed, getOwner, onCleanup } from "solid-js";

export const until = <T>(condition: Accessor<T>): Promise<Truthy<T>> =>
  createSubRoot(getOwner(), dispose => {
    return new Promise((resolve, reject) => {
      createComputed(() => {
        const v = condition();
        if (!v) return;
        resolve(v as Truthy<T>);
        dispose();
      });
      onCleanup(reject);
    });
  });

export function untilWithTimeout<T>(
  condition: Accessor<T>,
  ms: number,
  throwOnTimeout: true,
  reason?: string
): Promise<Truthy<T>>;
export function untilWithTimeout<T>(
  condition: Accessor<T>,
  ms: number,
  throwOnTimeout?: boolean,
  reason?: string
): Promise<Truthy<T> | undefined>;
export function untilWithTimeout(
  condition: Accessor<any>,
  ...raceTimeoutArgs: [any, any, any]
): Promise<any> {
  return createSubRoot(getOwner(), dispose => {
    const promise = new Promise((resolve, reject) => {
      createComputed(() => {
        const v = condition();
        if (!v) return;
        resolve(v);
        dispose();
      });
      onCleanup(reject);
    });
    return raceTimeout(promise, ...raceTimeoutArgs).finally(dispose);
  });
}
