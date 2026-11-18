import { type StoreSetter } from "@solidjs/signals";
import { createSignal, untrack } from "solid-js";
import type { ReactiveCollectionCompute } from "./index.ts";

export interface AliasSlots {
  slots: string[];
  track: () => number;
  notify: () => void;
}

// Value-form signals consume no hydration id and retain no user key.
export function createAliasSlots(slot: string): AliasSlots {
  const [track, update] = createSignal(0);
  return {
    slots: [slot],
    track,
    notify: () => {
      update(value => value + 1);
    },
  };
}

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
  beforeCommit?: () => void,
): void | Promise<void> | AsyncIterableIterator<void> {
  const commit = (result: void | Result) => {
    if (result !== undefined && result !== (draft as unknown)) replace(result);
  };
  const result = compute(draft);
  const method = result != null && (result as AsyncIterable<Result>)[Symbol.asyncIterator];
  if (typeof method === "function") {
    const source = Reflect.apply(method, result, []) as AsyncIterator<void | Result>;
    let closed = false,
      finished = false,
      yielded = false,
      revision = data.revision;
    const done = (): IteratorReturnResult<undefined> => ({ done: true, value: undefined });
    const adapter: AsyncIterableIterator<void> = {
      // Preserve the protocol used by Solid's public from(subscription): SSR
      // takes its first answer and hydration reconnects the subscription.
      [Symbol.for("solid.LiveSource")]: (result as any)[Symbol.for("solid.LiveSource")],
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (closed || finished) return done();
        let step: IteratorResult<void | Result>;
        try {
          step = await source.next();
        } catch (error) {
          if (closed) return done();
          throw error;
        }
        if (closed) return done();
        try {
          beforeCommit?.();
          if (!step.done) {
            commit(step.value);
            yielded = true;
            revision = data.revision;
            return { done: false, value: undefined };
          }
          finished = true;
          // SSR flushes on yields: include terminal edits and empty streams.
          // An iterable's terminal return value is ignored.
          return !yielded || revision !== data.revision
            ? { done: false, value: undefined }
            : done();
        } catch (error) {
          closed = true;
          await source.return?.();
          throw error;
        }
      },
      async return() {
        if (closed) return done();
        closed = true;
        // A generator wrapper queues return() behind next(). Forward it now
        // so event sources can release a pending pull and unsubscribe.
        await source.return?.();
        return done();
      },
    };
    return adapter;
  }
  const then = result != null && (result as PromiseLike<void | Result>).then;
  if (typeof then === "function")
    return new Promise<void | Result>((resolve, reject) => {
      Reflect.apply(then, result, [resolve, reject]);
    }).then(commit);
  commit(result as void | Result);
}
