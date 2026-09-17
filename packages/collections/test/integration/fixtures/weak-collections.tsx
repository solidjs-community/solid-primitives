import { createMemo, createSignal, Loading, refresh, untrack } from "solid-js";
import { createReactiveWeakMap, createReactiveWeakSet } from "../../../src/weak.js";

export let current: { read(): string; update(): void; refresh(): Promise<unknown> };
export let calls = 0;
export const kinds = ["promise", "stream", "hybrid", "loading", "client", "static"] as const;
export type Kind = (typeof kinds)[number];
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
type Key = { name: string };
type Value = { key: Key; count: number; self?: Value };

/** A real weak map/set sharing a separately serialized object key. */
export function WeakTokenFixture(props: { kind: Kind; optimistic: boolean }) {
  if (props.kind === "static") return StaticWeakFixture(props);
  const key = createMemo(async () => ({ name: "shared" }));
  const placeholder: Key = { name: "placeholder" };
  const [version, update] = createSignal(0);
  const change = (draft: WeakMap<Key, Value>, key: Key, count: number) => {
    draft.delete(placeholder);
    const value: Value = { key, count };
    value.self = value;
    draft.set(key, value);
  };
  const options = {
    optimistic: props.optimistic,
    ...(props.kind === "hybrid" || props.kind === "client" ? { ssrSource: props.kind } : {}),
  };
  const map = createReactiveWeakMap<Key, Value>(
    props.kind !== "stream" && props.kind !== "hybrid"
      ? async draft => {
          calls++;
          const k = key(),
            n = version();
          await sleep(2);
          change(draft, k, n);
        }
      : async function* (draft) {
          calls++;
          const k = key(),
            n = version();
          await sleep(2);
          change(draft, k, n);
          yield;
          await sleep(5);
          change(draft, k, n + 10);
        },
    {
      ...options,
      ...(props.kind === "loading" || props.kind === "client"
        ? {
            loadingValue: [[placeholder, { key: placeholder, count: -1 }]] as const,
          }
        : {}),
      deferStream: props.kind === "promise",
    },
  );
  const set = createReactiveWeakSet<Key>(draft => {
    draft.add(key());
  }, options);
  const read = () => {
    if (map.has(placeholder)) return "placeholder";
    const k = key(),
      value = map.get(k);
    return `${map.has(k) && set.has(k)}:${value?.key === k}:${value?.self === value}:${value?.count}`;
  };
  current = {
    read,
    update: () => update(n => n + 1),
    refresh: () => Promise.all([refresh(map), refresh(set)]),
  };
  return (
    <section>
      <Loading fallback={<span>loading</span>}>
        <span data-value="">{read()}</span>
      </Loading>
      <b>after</b>
    </section>
  );
}

/** Iterable initialization does not route through a user computation. */
function StaticWeakFixture(props: { optimistic: boolean }) {
  const key = untrack(createMemo(() => ({ name: "static-shared" })));
  const value: Value = { key, count: 0 };
  value.self = value;
  const map = createReactiveWeakMap<Key, Value>([[key, value]], { optimistic: props.optimistic });
  const set = createReactiveWeakSet<Key>([key], { optimistic: props.optimistic });
  const read = () => {
    const entry = map.get(key);
    return `${map.has(key) && set.has(key)}:${entry?.key === key}:${entry?.self === entry}:${entry?.count}`;
  };
  current = {
    read,
    update() {
      const entry: Value = { key, count: 1 };
      entry.self = entry;
      map.set(key, entry);
      set.delete(key);
      set.add(key);
    },
    refresh: () => Promise.resolve(),
  };
  return (
    <section>
      <span data-value="">{read()}</span>
      <b>after</b>
    </section>
  );
}
