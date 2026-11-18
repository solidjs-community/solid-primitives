import { createSignal, Loading } from "solid-js";
import { isServer } from "@solidjs/web";
import { createReactiveMap } from "../../src/index.ts";

const NativePromise = Promise;
export interface TraceFixtureState {
  opened: number;
  closed: number;
  returns: number;
  release(): void;
  read(): number | undefined;
  update(): void;
}

export type TraceKind =
  | "iterable"
  | "iterable-next"
  | "promise"
  | "generator"
  | "generator-live"
  | "generator-accessor"
  | "generator-pending";
export const traceKinds: TraceKind[] = [
  "iterable",
  "iterable-next",
  "promise",
  "generator",
  "generator-live",
  "generator-accessor",
  "generator-pending",
];

export function TracingFixture(props: {
  kind: TraceKind;
  onCreate?: (state: TraceFixtureState) => void;
}) {
  const [revision, update] = createSignal(0);
  const state: TraceFixtureState = {
    opened: 0,
    closed: 0,
    returns: 0,
    release: () => {},
    read: () => map.get("value"),
    update: () => update(n => n + 1),
  };
  props.onCreate?.(state);
  const map = createReactiveMap<string, number>(() => {
    if (props.kind.startsWith("generator")) {
      let releaseTrace: (() => void) | undefined;
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
          if (props.kind === "generator-pending" && !isServer && n === 0)
            await new NativePromise<void>((_, reject) => {
              releaseTrace = state.release = () => reject(new Error("late trace rejection"));
            });
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
      const finish = source.return;
      source.return = value => {
        state.returns++;
        releaseTrace?.();
        return Reflect.apply(finish, source, [value]);
      };
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
    const iterable = {
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
    return props.kind === "iterable-next"
      ? Object.assign(iterable, {
          next() {
            throw new Error("outer next must not run");
          },
        })
      : iterable;
  });
  return (
    <Loading fallback="loading">
      <span>{map.get("value")}</span>
    </Loading>
  );
}
