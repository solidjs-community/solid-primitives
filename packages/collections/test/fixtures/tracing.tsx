import { createSignal, Loading } from "solid-js";
import { isServer } from "@solidjs/web";
import { createReactiveMap } from "../../src/index.ts";

const NativePromise = Promise;
export let traceCurrent: {
  opened: number;
  closed: number;
  read(): number | undefined;
  update(): void;
};

export function TracingFixture(props: { kind: "iterable" | "promise" | "generator" }) {
  const [revision, update] = createSignal(0);
  const state = {
    opened: 0,
    closed: 0,
    read: () => map.get("value"),
    update: () => update(n => n + 1),
  };
  const map = createReactiveMap<string, number>(() => {
    const n = revision();
    if (props.kind === "promise")
      return (async () => {
        await NativePromise.resolve();
        if (!isServer && n === 0) throw new Error("discarded trace rejection");
        return new Map([["value", n + 1]]);
      })();
    if (props.kind === "generator")
      return (async function* () {
        // This first pull runs during the discarded client trace too.
        await NativePromise.resolve();
        if (!isServer && n === 0) throw new Error("discarded generator trace rejection");
        yield new Map([["value", n + 1]]);
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
