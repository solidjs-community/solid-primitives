import { createSignal, Loading } from "solid-js";
import { isServer } from "@solidjs/web";
import { createReactiveMap } from "../../src/index.ts";

const NativePromise = Promise;
export let traceCurrent: {
  opened: number;
  closed: number;
  release(): void;
  read(): number | undefined;
  update(): void;
};

export type TraceKind =
  "iterable" | "promise" | "generator" | "generator-live" | "generator-accessor";
export const traceKinds: TraceKind[] = [
  "iterable",
  "promise",
  "generator",
  "generator-live",
  "generator-accessor",
];

export function TracingFixture(props: { kind: TraceKind }) {
  const [revision, update] = createSignal(0);
  const state = {
    opened: 0,
    closed: 0,
    release: () => {},
    read: () => map.get("value"),
    update: () => update(n => n + 1),
  };
  const map = createReactiveMap<string, number>(() => {
    if (props.kind.startsWith("generator")) {
      const source = (async function* () {
        // The generator body must be pulled to capture this dependency.
        const n = revision();
        if (props.kind === "generator") {
          await NativePromise.resolve();
          if (!isServer && n === 0) throw new Error("discarded generator trace rejection");
          yield new Map([["value", n + 1]]);
          return;
        }
        state.opened++;
        try {
          await NativePromise.resolve();
          yield new Map([["value", n + 1]]);
          if (!isServer)
            await new NativePromise<void>(resolve => {
              state.release = resolve;
            });
        } finally {
          state.closed++;
        }
      })();
      if (props.kind === "generator-accessor") {
        const next = source.next;
        Object.defineProperty(source, "next", { get: () => next });
      }
      return source;
    }
    const n = revision();
    if (props.kind === "promise")
      return (async () => {
        await NativePromise.resolve();
        if (!isServer && n === 0) throw new Error("discarded trace rejection");
        return new Map([["value", n + 1]]);
      })();
    return {
      [Symbol.asyncIterator]() {
        state.opened++;
        let first = true;
        let finish: ((result: IteratorResult<Map<string, number>>) => void) | undefined;
        return {
          next() {
            if (first) {
              first = false;
              return NativePromise.resolve({
                done: false as const,
                value: new Map([["value", n + 1]]),
              });
            }
            if (isServer) return NativePromise.resolve({ done: true as const, value: undefined });
            return new NativePromise<IteratorResult<Map<string, number>>>(resolve => {
              finish = resolve;
            });
          },
          return() {
            state.closed++;
            finish?.({ done: true, value: undefined });
            return NativePromise.resolve({ done: true as const, value: undefined });
          },
        };
      },
    };
  });
  traceCurrent = state;
  return (
    <Loading fallback="loading">
      <span>{map.get("value")}</span>
    </Loading>
  );
}
