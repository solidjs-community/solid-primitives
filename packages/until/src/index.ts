import { Truthy, Fn, createSubRoot } from "@solid-primitives/utils";
import { Accessor, createComputed, onCleanup } from "solid-js";

export type Until<T> = Promise<Truthy<T>> & { dispose: Fn };

export const until = <T>(condition: Accessor<T>): Until<T> =>
  createSubRoot(dispose => {
    const promise = new Promise((resolve, reject) => {
      createComputed(() => {
        const v = condition();
        if (!v) return;
        resolve(v as Truthy<T>);
        dispose();
      });
      onCleanup(reject);
    }) as Until<T>;
    Object.assign(promise, { dispose });
    return promise;
  });
