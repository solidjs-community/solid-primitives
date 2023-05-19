import { describe, bench } from "vitest";
import { batch, createEffect, createRoot } from "solid-js";
import { captureStoreUpdates, trackDeep, trackStore } from "../src";
import { createStore } from "solid-js/store";

const fns = {
  // stringify: store => () => JSON.stringify(store),
  trackDeep: store => () => trackDeep(store),
  trackStore: store => () => trackStore(store),
  // captureUpdates: captureStoreUpdates,
} as const satisfies Record<string, (store: any) => () => void>;
type FnKeys = keyof typeof fns;
type Fn = (typeof fns)[FnKeys];
const entries = Object.entries(fns) as [FnKeys, Fn][];

const createStoreTrackingEffect = (createFn: Fn, store: object, nEffects: number) => {
  return createRoot(dispose => {
    const fn = createFn(store);

    for (let i = 0; i < nEffects; i++) {
      createEffect(() => {
        fn();
      });
    }

    return dispose;
  });
};

for (const nEffects of [1, 10]) {
  describe("shallow " + nEffects, () => {
    for (const [fnName, createFn] of entries) {
      bench(fnName, () => {
        const [sign, set] = createStore(
          Array.from({ length: 100 }, () => ({ a: { "a.b": "thoughts" }, b: "foo" })),
        );

        const dispose = createStoreTrackingEffect(createFn, sign, nEffects);

        for (let n = 0; n < 2; n++) {
          for (let i = 0; i < 10; i++) {
            batch(() => {
              set(i * 10, "a", "a.b", "minds" + n);
              set(i * 10, "b", "bar" + n);
            });
          }
        }

        dispose();
      });
    }
  });

  describe("deep " + nEffects, () => {
    for (const [fnName, createFn] of entries) {
      bench(fnName, () => {
        const [sign, set] = createStore(
          Array.from({ length: 10 }, (_, i) => ({
            id: i,
            a: {
              "a.b": "thoughts",
              array: Array.from({ length: 10 }, (_, i) => ({
                title: "title",
                description: "description",
                id: i,
                array: Array.from({ length: 10 }, (_, i) => ({
                  done: false,
                  id: i,
                })),
              })),
            },
            b: "foo",
          })),
        );

        const dispose = createStoreTrackingEffect(createFn, sign, nEffects);

        for (let n = 0; n < 2; n++) {
          for (let i = 0; i < 10; i++) {
            set(i, "a", "array", i, "array", i, "done", p => !p);
          }
        }

        dispose();
      });
    }
  });

  describe("root " + nEffects, () => {
    for (const [fnName, createFn] of entries) {
      bench(fnName, () => {
        const [sign, set] = createStore(
          Array.from({ length: 10 }, (_, i) => ({
            id: i,
            a: {
              "a.b": "thoughts",
              array: Array.from({ length: 10 }, (_, i) => ({
                title: "title",
                description: "description",
                id: i,
                array: Array.from({ length: 10 }, (_, i) => ({
                  done: false,
                  id: i,
                })),
              })),
            },
            b: "foo",
          })),
        );

        const dispose = createStoreTrackingEffect(createFn, sign, nEffects);

        for (let n = 0; n < 2; n++) {
          for (let i = 0; i < 10; i++) {
            set(i, "b", "foo" + i + n);
          }
        }

        dispose();
      });
    }
  });
}
