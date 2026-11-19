import type { ReactiveCollectionCompute } from "./index.ts";

function noop(): void {}

function iteratorResult(done: boolean): IteratorResult<void> {
  return { done, value: undefined };
}

function generatorShaped(value: object): boolean {
  const seen = new Set<object>();
  try {
    for (let proto: object | null = value, depth = 0; proto && depth < 32; depth++) {
      if (seen.has(proto)) return false;
      seen.add(proto);
      // A callable next alone does not prove that the iterable is its iterator.
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
  data: { readonly _revision: number },
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
        finished = false;
      let lastYieldRevision: number | undefined;
      const close = () => {
        if (!closed) {
          closed = true;
          // Cleanup is best effort here: its failure or latency must never
          // replace or delay the error from the source/commit.
          try {
            const cleanup = source.return?.();
            if (cleanup) void cleanup.then(undefined, noop);
          } catch {
            /* preserve the original failure */
          }
        }
      };
      const fail = (error: unknown): never => {
        if (tracing) queueMicrotask(close);
        else close();
        throw error;
      };
      const pull = async (): Promise<IteratorResult<void>> => {
        if (closed || finished) return iteratorResult(true);
        let step: IteratorResult<void | Result>;
        try {
          next ??= source.next;
          const pending = Reflect.apply(next, source, []);
          // The synchronous part of next() captures dependencies. Do not wait
          // for a discarded pull that may need return() to release its wait.
          // A microtask also lets Solid restore the real Promise/fetch first.
          if (tracing) queueMicrotask(close);
          step = await pending;
        } catch (error) {
          if (closed) return iteratorResult(true);
          return fail(error);
        }
        if (closed || tracing) return iteratorResult(true);
        try {
          if (!step.done) {
            commit(step.value);
            lastYieldRevision = data._revision;
            return iteratorResult(false);
          }
          commit();
          finished = true;
          return iteratorResult(lastYieldRevision === data._revision);
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
          void pending.then(undefined, noop);
          return pending;
        },
        async return() {
          if (closed || finished) return iteratorResult(true);
          closed = true;
          await source.return?.();
          return iteratorResult(true);
        },
      };
    };
    // Keep Solid's generator-shaped dependency trace, but do not turn an
    // ordinary iterable into a generator: opening it may subscribe to events.
    const adapted: AsyncIterable<void> = generatorShaped(result as object)
      ? open()
      : { [Symbol.asyncIterator]: open };
    const liveSource = Symbol.for("solid.LiveSource");
    Object.defineProperty(adapted, liveSource, {
      value: (result as any)[liveSource],
    });
    return adapted;
  }
  const then = result != null && (result as PromiseLike<void | Result>).then;
  if (typeof then === "function") {
    let resolve: (value: void | Result | PromiseLike<void | Result>) => void = noop;
    let reject: (error: unknown) => void = noop;
    const pending = new Promise<void | Result>((yes, no) => {
      resolve = yes;
      reject = no;
    });
    // Hydration tracing replaces the global Promise with a mock that skips
    // executors. Attach to the original source outside that executor anyway.
    try {
      Reflect.apply(then, result, [resolve, reject]);
    } catch (error) {
      reject(error);
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
