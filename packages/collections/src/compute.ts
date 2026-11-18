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

function generatorShaped(value: object): boolean {
  const seen = new Set<object>();
  let foundNext = false;
  try {
    for (let proto: object | null = value, depth = 0; proto && depth < 32; depth++) {
      if (seen.has(proto)) return false;
      seen.add(proto);
      if (!foundNext) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, "next");
        if (descriptor) {
          foundNext = true;
          if (typeof descriptor.value === "function") return true;
        }
      }
      // Native generators remain traceable when an accessor shadows next.
      if (Object.getOwnPropertyDescriptor(proto, Symbol.toStringTag)?.value === "AsyncGenerator")
        return true;
      proto = Object.getPrototypeOf(proto);
    }
  } catch {
    // Exotic objects may refuse inspection; consume them as lazy iterables.
  }
  return false;
}

export function runCompute<Draft, Result>(
  compute: ReactiveCollectionCompute<Draft, Result>,
  draft: Draft,
  replace: (result: Result) => void,
  data: { readonly revision: number },
  beforeCommit?: () => void,
  afterCommit?: () => void,
): void | Promise<void> | AsyncIterable<void> {
  const commit = (result: void | Result) => {
    beforeCommit?.();
    if (result !== undefined && result !== (draft as unknown)) replace(result);
    afterCommit?.();
  };
  const result = compute(draft);
  const method = result != null && (result as AsyncIterable<Result>)[Symbol.asyncIterator];
  if (typeof method === "function") {
    const open = (): AsyncIterableIterator<void> => {
      const source = Reflect.apply(method, result, []) as AsyncIterator<void | Result>;
      // Solid's discarded dependency trace replaces Promise with a mock whose
      // constructor skips executors. Capture that boundary while it is active;
      // a live compute during hydration still executes a normal executor.
      let tracing = true;
      void new Promise<void>(resolve => {
        tracing = false;
        resolve();
      });
      let next: AsyncIterator<void | Result>["next"] | undefined;
      let closed = false,
        finished = false,
        yielded = false,
        revision = data.revision;
      const done = (): IteratorReturnResult<undefined> => ({ done: true, value: undefined });
      const close = () => {
        if (!closed) {
          closed = true;
          // Cleanup is best effort here: its failure or latency must never
          // replace or delay the error from the source/commit.
          try {
            const cleanup = source.return?.();
            if (cleanup) void cleanup.then(undefined, () => {});
          } catch {
            /* preserve the original failure */
          }
        }
      };
      const fail = (error: unknown): never => {
        close();
        throw error;
      };
      const pull = async (): Promise<IteratorResult<void>> => {
        if (closed || finished) return done();
        let step: IteratorResult<void | Result>;
        try {
          next ??= source.next;
          step = await Reflect.apply(next, source, []);
        } catch (error) {
          if (closed) return done();
          return fail(error);
        }
        if (closed) return done();
        if (tracing) {
          // Dependencies were captured by the first pull. Its value is ignored,
          // so close the suspended generator instead of leaving resources live.
          close();
          return done();
        }
        try {
          if (!step.done) {
            commit(step.value);
            yielded = true;
            revision = data.revision;
            return { done: false, value: undefined };
          }
          beforeCommit?.();
          afterCommit?.();
          finished = true;
          return !yielded || revision !== data.revision
            ? { done: false, value: undefined }
            : done();
        } catch (error) {
          return fail(error);
        }
      };
      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        next() {
          const pending = pull();
          // Solid traces a generator's first pull but discards the result.
          // Observe rejection even when that trace has no consuming caller.
          void pending.then(undefined, () => {});
          return pending;
        },
        async return() {
          if (closed || finished) return done();
          closed = true;
          await source.return?.();
          return done();
        },
      };
    };
    // Keep Solid's generator-shaped dependency trace, but do not turn an
    // ordinary iterable into a generator: opening it may subscribe to events.
    const adapted: AsyncIterable<void> = generatorShaped(result as object)
      ? open()
      : { [Symbol.asyncIterator]: open };
    Object.defineProperty(adapted, Symbol.for("solid.LiveSource"), {
      value: (result as any)[Symbol.for("solid.LiveSource")],
    });
    return adapted;
  }
  const then = result != null && (result as PromiseLike<void | Result>).then;
  if (typeof then === "function") {
    let resolve: ((value: void | Result | PromiseLike<void | Result>) => void) | undefined;
    let reject: ((error: unknown) => void) | undefined;
    const pending = new Promise<void | Result>((yes, no) => {
      resolve = yes;
      reject = no;
    });
    // Hydration tracing replaces the global Promise with a mock that skips
    // executors. Attach to the original source outside that executor anyway.
    try {
      Reflect.apply(then, result, [
        (value: void | Result) => {
          resolve?.(value);
        },
        (error: unknown) => {
          reject?.(error);
        },
      ]);
    } catch (error) {
      reject?.(error);
    }
    return pending.then(commit);
  }
  commit(result as void | Result);
}

// Cache a callable iterable's method at dispatch instead of probing a getter
// and reading it again when Map/Set consumes the initializer.
export function normalizeCollectionInput<T>(value: T): T {
  if (typeof value === "function") {
    const method = (value as any)[Symbol.iterator];
    if (typeof method === "function")
      return { [Symbol.iterator]: () => Reflect.apply(method, value, []) } as T;
  }
  return value;
}
