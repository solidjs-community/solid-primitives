import { type StoreSetter } from "@solidjs/signals";
import { untrack } from "solid-js";
import type { ReactiveCollectionCompute } from "./index.js";

// A separate closure avoids retaining a factory's input and old loading seed.
// Bookkeeping reads the draft without becoming dependencies of the compute,
// including when the producer writes after an await.
export function collectionWriter<T>(state: T): StoreSetter<T> {
  return fn => {
    untrack(() => fn(state));
  };
}

export function runCompute<Draft, Result>(
  compute: ReactiveCollectionCompute<Draft, Result>,
  draft: Draft,
  replace: (result: Result) => void,
  data: { readonly revision: number },
): void | Promise<void> | AsyncGenerator<void> {
  const commit = (result: void | Result) => {
    if (result !== undefined && result !== (draft as unknown)) replace(result);
  };
  const result = compute(draft);
  if (
    result != null &&
    typeof (result as AsyncIterable<Result>)[Symbol.asyncIterator] === "function"
  ) {
    return (async function* () {
      let yielded = false,
        revision = data.revision;
      // for-await forwards cleanup. Solid guards the draft against superseded
      // and disposed producers, including writes after awaits and yields.
      for await (const value of result as AsyncIterable<void | Result>) {
        commit(value);
        yielded = true;
        revision = data.revision;
        yield;
      }
      // SSR flushes on yields: include terminal edits and producers with no
      // explicit yields. An iterable's terminal return value is ignored.
      if (!yielded || revision !== data.revision) yield;
    })();
  }
  if (result != null && typeof (result as PromiseLike<Result>).then === "function")
    return Promise.resolve(result as PromiseLike<void | Result>).then(commit);
  commit(result as void | Result);
}
