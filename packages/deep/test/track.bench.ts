import { describe, bench } from "vitest";
import { batch, createEffect, createRoot } from "solid-js";
import { deepTrack, trackStore1, trackStore2, trackStore3 } from "../src";
import { createStore } from "solid-js/store";

const fns = [deepTrack, trackStore1, trackStore2, trackStore3];

const createStoreTrackingEffect = (fn: (typeof fns)[number], store: object, nEffects: number) => {
  return createRoot(dispose => {
    for (let i = 0; i < nEffects; i++) {
      createEffect(() => {
        fn(store);
      });
    }

    return dispose;
  });
};

for (const nEffects of [1, 10]) {
  describe("shallow " + nEffects, () => {
    for (const fn of fns) {
      bench(fn.name, () => {
        const [sign, set] = createStore(
          Array.from({ length: 100 }, () => ({ a: { "a.b": "thoughts" }, b: "foo" })),
        );

        const dispose = createStoreTrackingEffect(fn, sign, nEffects);

        for (let i = 0; i < 10; i++) {
          batch(() => {
            set(i * 10, "a", "a.b", "minds");
            set(i * 10, "b", "bar");
          });
        }

        dispose();
      });
    }
  });

  describe("deep " + nEffects, () => {
    for (const fn of fns) {
      bench(fn.name, () => {
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

        const dispose = createStoreTrackingEffect(fn, sign, nEffects);

        for (let i = 0; i < 10; i++) {
          set(i, "a", "array", i, "array", i, "done", true);
        }

        dispose();
      });
    }
  });

  describe("root " + nEffects, () => {
    for (const fn of fns) {
      bench(fn.name, () => {
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

        const dispose = createStoreTrackingEffect(fn, sign, nEffects);

        for (let i = 0; i < 10; i++) {
          set(i, "b", "foo" + i);
        }

        dispose();
      });
    }
  });
}
