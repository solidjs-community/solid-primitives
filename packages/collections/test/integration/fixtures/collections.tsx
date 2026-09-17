import {
  createMemo,
  createSignal,
  createStore,
  createOptimisticStore,
  Loading,
  refresh,
} from "solid-js";
import { createReactiveMap } from "../../../src/index.js";
import { createReactiveSet } from "../../../src/index.js";
export const kinds = ["promise", "stream", "loading", "client", "hybrid", "store-hybrid"] as const;
export type Kind = (typeof kinds)[number];
type Key = { tag: string } | string;
type Value = { n: number; date: Date; missing: undefined; nan: number; big: bigint; self?: Value };
export let current: {
  read: () => string;
  update: () => void;
  refresh: () => Promise<unknown>;
};
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const value = (n: number): Value => {
  const result: Value = { n, date: new Date(0), missing: undefined, nan: NaN, big: 1n };
  result.self = result;
  return result;
};
export function CollectionFixture(props: { kind: Kind; optimistic: boolean }) {
  if (props.kind === "store-hybrid") return StoreHybridFixture(props);
  const [version, update] = createSignal(0);
  // The same serialized object must be shared between this source and the map.
  // A deep JSON snapshot of the store would silently break that identity.
  const key = createMemo(async () => ({ tag: "shared" }));
  const compute =
    props.kind === "stream" || props.kind === "hybrid"
      ? async function* (draft: Map<Key, Value>) {
          const n = version(),
            k = key();
          await sleep(2);
          draft.set(k, value(n));
          yield;
          await sleep(5);
          draft.set(k, value(n + 10));
          yield;
          draft.set("tail", value(99));
        }
      : async (draft: Map<Key, Value>) => {
          const n = version(),
            k = key();
          await sleep(2);
          draft.clear();
          draft.set(k, value(n));
        };
  const map = createReactiveMap<Key, Value>(compute, {
    optimistic: props.optimistic,
    ...(props.kind === "loading" || props.kind === "client"
      ? { loadingValue: new Map<Key, Value>([["placeholder", value(-1)]]) }
      : {}),
    ...(props.kind === "client" || props.kind === "hybrid" ? { ssrSource: props.kind } : {}),
    deferStream: props.kind === "promise",
  });
  const read = () => {
    if (map.has("placeholder")) return "placeholder";
    const k = key(),
      entry = map.get(k);
    return `${map.has(k)}:${entry?.n}:${entry?.date instanceof Date && entry.big === 1n && entry.self === entry}:${Number.isNaN(entry?.nan)}:${map.size}:${map.has("tail")}`;
  };
  current = { read, update: () => update(n => n + 1), refresh: () => refresh(map) };
  return (
    <section>
      <Loading fallback={<span data-loading="">loading</span>}>
        <span data-value="">{read()}</span>
      </Loading>
      <b data-sibling="">after</b>
    </section>
  );
}

// Control case: exercise the same delayed hybrid handoff without collections.
function StoreHybridFixture(props: { optimistic: boolean }) {
  const [version, update] = createSignal(0);
  const key = createMemo(async () => ({ tag: "shared" }));
  const [state] = (props.optimistic ? createOptimisticStore : createStore)(
    async function* (draft) {
      const n = version(),
        k = key();
      await sleep(2);
      draft.key = k;
      draft.value = value(n);
      yield;
      await sleep(5);
      draft.value = value(n + 10);
      yield;
      draft.tail = true;
    },
    { key: undefined as Key | undefined, value: undefined as Value | undefined, tail: false },
    { shallow: true, ssrSource: "hybrid" },
  );
  const read = () => {
    const entry = state.value;
    return `${state.key === key()}:${entry?.n}:${entry?.date instanceof Date && entry.big === 1n && entry.self === entry}:${Number.isNaN(entry?.nan)}:${state.tail ? 2 : 1}:${state.tail}`;
  };
  current = { read, update: () => update(n => n + 1), refresh: () => refresh(state) };
  return (
    <section>
      <Loading fallback={<span>loading</span>}>
        <span>{read()}</span>
      </Loading>
      <b>after</b>
    </section>
  );
}

export let currentSet: {
  set: Set<unknown>;
  read: () => string;
  update: () => void;
  refresh: () => Promise<unknown>;
};
export function SetCollectionFixture(props: {
  kind: "stream" | "loading" | "client" | "hybrid";
  optimistic: boolean;
}) {
  const [version, update] = createSignal(0);
  const key = createMemo(async () => ({ tag: "set-key" }));
  const set = createReactiveSet<unknown>(
    async function* (draft) {
      const revision = version();
      const k = key();
      await sleep(2);
      draft.clear();
      draft.add(k);
      draft.add(NaN);
      draft.add(Symbol.for("set-symbol"));
      draft.add(revision);
      yield;
      await sleep(5);
      draft.add("tail");
    },
    {
      optimistic: props.optimistic,
      ...(props.kind !== "stream" ? { loadingValue: new Set(["placeholder"]) } : {}),
      ...(props.kind === "client" || props.kind === "hybrid" ? { ssrSource: props.kind } : {}),
    },
  );
  const read = () =>
    set.has("placeholder")
      ? "placeholder"
      : `${set.has(key())}:${set.has(NaN)}:${set.has(Symbol.for("set-symbol"))}:${set.size}:${set.has("tail")}:${set.has(version())}`;
  currentSet = { set, read, update: () => update(n => n + 1), refresh: () => refresh(set) };
  return (
    <section>
      <Loading fallback={<span>loading</span>}>
        <span data-value="">{read()}</span>
      </Loading>
      <b>after</b>
    </section>
  );
}
