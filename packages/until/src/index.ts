import { Truthy, Fn, createSubRoot } from "@solid-primitives/utils";
import { Accessor, createComputed, createMemo, onCleanup } from "solid-js";

export type Until<T> = Promise<Truthy<T>> & { dispose: Fn };

export const until = <T>(condition: Accessor<T>): Until<T> =>
  createSubRoot(dispose => {
    const memo = createMemo(condition);
    const promise = new Promise((resolve, reject) => {
      createComputed(() => {
        if (!memo()) return;
        resolve(memo() as Truthy<T>);
        dispose();
      });
      onCleanup(reject);
    }) as Until<T>;
    Object.assign(promise, { dispose });
    return promise;
  });
