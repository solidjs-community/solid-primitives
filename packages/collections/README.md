<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Collections" alt="Solid Primitives Collections">
</p>

# @solid-primitives/collections

Reactive Map, Set, WeakMap, and WeakSet factories with per-key tracking, computed drafts, async sources, optimistic updates, and SSR.

- [`createReactiveMap`](#createreactivemap)
- [`createReactiveSet`](#createreactiveset)
- [`createReactiveWeakMap`](#createreactiveweakmap)
- [`createReactiveWeakSet`](#createreactiveweakset)

> For synchronous reactive classes, see [`@solid-primitives/map`](../map/README.md) and [`@solid-primitives/set`](../set/README.md).

## Installation

```sh
npm install @solid-primitives/collections
# or
yarn add @solid-primitives/collections
# or
pnpm add @solid-primitives/collections
```

## `createReactiveMap`

Creates a shallow reactive `Map` from entries or a compute function. Each observed key gets its own lazily created presence and value nodes, so reading `map.get(a)` does not subscribe to changes to `b`. Object keys and values retain their references.

```ts
import { createReactiveMap } from "@solid-primitives/collections";

// Create inside a component or reactive owner.
const counts = createReactiveMap<string, number>();
const counts = createReactiveMap<string, number>([["a", 1]]);
const totals = createReactiveMap<string, number>(draft => {
  draft.set("total", items().length);
});
const users = createReactiveMap(
  async () => {
    const group = groupId();
    const result: User[] = await fetchUsers(group);
    return new Map(result.map(user => [user.id, user]));
  },
  { optimistic: true },
);
const users = createReactiveMap<string, User>(async function* (draft) {
  for await (const user of updates()) {
    draft.set(user.id, user);
    yield;
  }
});
```

```ts
type CreateReactiveMapComputeFunction<K, V> = (
  draft: Map<K, V>,
) =>
  | void
  | ReadonlyMap<K, V>
  | PromiseLike<void | ReadonlyMap<K, V>>
  | AsyncIterable<void | ReadonlyMap<K, V>>;

type CreateReactiveMapOptions<K, V> = {
  name?: string;
  optimistic?: boolean;
  loadingValue?: ReadonlyMap<K, V>;
  deferStream?: boolean;
  ssrSource?: "server" | "hybrid" | "client";
};
```

Reactive semantics follow Solid stores: batched reads & writes, errors, pending status, supersession and disposal. Likewise, `optimistic` follows optimistic stores: independent value edits can settle independently, while overlapping structural actions share order/size state and can settle together. The returned map is shallow: nested object changes are not tracked.

The compute function has similar semantics to `createStore`: Mutate the draft and return `void`, or return a `Map`/`ReadonlyMap` to replace the contents. Async functions and generators are also supported. An AsyncIterable can yield replacement maps or `void` after editing the draft. Final draft edits before the iterable completes are also applied, but the terminal `return` value is ignored. Inputs and returned maps are copied, never mutated. When using a compute function, the primitive returns a `Refreshable<Map<K, V>>` so it can be used with Solid's `refresh`.

`deferStream` delays SSR flushing for the first answer, and `ssrSource` selects Solid's normal server/hybrid/client hydration policy. Client-only sources need `Loading` or initial `loadingValue` on the server. Computes may run during hydration to discover dependencies and should avoid unrelated side effects. SSR transports the backing store, preserving shared serializable object identities between sources and collection keys. Dates, `NaN`, `undefined`, BigInts, cycles, and registered/well-known symbol keys are supported. Functions, local symbol keys, and other unsupported values still require a client-only source or an application serialization strategy.

Iterators are live and track when consumed, including iterators created outside a tracking scope. They skip removed entries, see appended entries and updated values, and remain finished once exhausted. An order-changing replacement starts a fresh insertion generation, as with clear/reinsert. Optimistic rollback restores the collection but does not rewind an existing iterator past entries it has already consumed. Consume a fresh iterator inside each reactive computation.

The result implements the Map methods through a subclass facade. Native intrinsics such as `Map.prototype.get.call(map, key)`, `structuredClone(map)`, and serializers that inspect native Map storage bypass it. Use `new Map(map)` when passing contents to those APIs. Full live traversal is slower than native Map traversal; this helper is intended primarily for tracked reads and computed/async collections.

weak symbol bookkeeping requires a runtime supporting symbols in `WeakMap`/`WeakRef`.

## `createReactiveWeakMap`

Like `createReactiveMap`, but creates a _weak_ collection with separate lazy membership and value tracking for every key.

```ts
import { createReactiveWeakMap } from "@solid-primitives/collections";

const metadata = createReactiveWeakMap<object, string>(async draft => {
  const item = selectedItem();
  const label = await fetchLabel(item);
  draft.set(item, label);
});

// Iterable replacements are supported, including arrays and ordinary Maps.
const visible = createReactiveWeakMap(() => items().map(item => [item, true] as const));
```

```ts
type CreateReactiveWeakMapComputeFunction<K extends WeakKey, V> = (
  draft: WeakMap<K, V>,
) =>
  | void
  | Iterable<readonly [K, V]>
  | PromiseLike<void | Iterable<readonly [K, V]>>
  | AsyncIterable<void | Iterable<readonly [K, V]>>;
```

The compute draft recieves a `WeakMap<K, V>`. It can mutate the draft and return/yield `void`, or return/yield iterable replacement entries. Unlike regular Maps, native WeakMaps cannot be enumerated, so they are not accepted as replacements or initial inputs. For the same reason, there is no `size`, iteration, or `clear()` method. Keys must be `WeakKey`s, just like native `WeakMap`.

To support SSR, install the optional codec in the renderer:

```ts
import { WeakCollectionTokenPlugin } from "@solid-primitives/collections/serialization";

renderToStream(() => <App />, { plugins: [WeakCollectionTokenPlugin] });
```

This supports shared serializable key identities, promises, streamed drafts, loading values, and server/hybrid/client hydration policies. Script hydration reconstructs the weak containers without a client codec import; JSON codecs need the plugin on both peers. Functions and local symbols are client-only unless an application supplies a suitable transport strategy. Solid/Seroval's decoding reference tables can retain transported keys after hydration; the collection cannot safely release those shared tables. A client-only source with an empty loading seed avoids transporting its entries.

## `createReactiveSet`

Creates a shallow reactive `Set` from an iterable or a compute function. Each tracked `set.has(value)` gets a separate lazily created membership node, and adding an unrelated value does not trigger the dependencies of others. Objects keep their identity.

```ts
import { createReactiveSet } from "@solid-primitives/collections";

// Create inside a component or reactive owner.
const selected = createReactiveSet<number>();
const active = createReactiveSet(() => new Set(items().filter(item => item.active)));
const allowed = createReactiveSet(async () => {
  const id = userId();
  return new Set(await fetchAllowedIds(id));
});

// Use `optimistic: true` create an optimistic set
const optimistic = createReactiveSet<number>([], { optimistic: true });
```

```ts
type CreateReactiveSetComputeFunction<T> = (
  draft: Set<T>,
) =>
  void | ReadonlySet<T> | PromiseLike<void | ReadonlySet<T>> | AsyncIterable<void | ReadonlySet<T>>;

type CreateReactiveSetOptions<T> = {
  name?: string;
  optimistic?: boolean;
  loadingValue?: ReadonlySet<T>;
  deferStream?: boolean;
  ssrSource?: "server" | "hybrid" | "client";
};
```

Reactive semantics follow Solid stores: batched reads & writes, errors, pending status, supersession and disposal. Likewise, `optimistic` follows optimistic stores: independent value edits can settle independently, while overlapping structural actions share order/size state and can settle together.

The compute function has similar semantics to `createStore`: Mutate the draft and return `void`, or return a `Set`/`ReadonlySet` to replace the contents. Async functions and generators are also supported. An AsyncIterable can yield replacement sets or `void` after editing the draft. Final draft edits before the iterable completes are also applied, but the terminal `return` value is ignored. Inputs and returned sets are copied, never mutated. When using a compute function, the primitive returns a `Refreshable<Set<T>>` so it can be used with Solid's `refresh`.

`deferStream` delays SSR flushing for the first answer, and `ssrSource` selects Solid's normal server/hybrid/client hydration policy. Client-only sources need `Loading` or initial `loadingValue` on the server. Computes may run during hydration to discover dependencies and should avoid unrelated side effects. SSR preserves serializable object identities and supports registered/well-known symbol values. However, functions and local symbols are not automatically serialized and need a client-only source or an application serialization strategy.

Iterators are live and track when consumed, including iterators created outside a tracking scope. They skip removed entries, see appended entries and updated values, and remain finished once exhausted. An order-changing replacement starts a fresh insertion generation, as with clear/reinsert. Optimistic rollback restores the collection but does not rewind an existing iterator past entries it has already consumed. Consume a fresh iterator inside each reactive computation.

The returned Set is a subclass facade. Native intrinsics, `structuredClone`, and serializers inspecting native Set storage bypass its methods; pass `new Set(set)` to such APIs. Full live traversal is slower than native Set traversal.

The Set algebra methods return ordinary snapshot Sets.

## `createReactiveWeakSet`

Like `createReactiveSet`, but creates a _weak_ collection with lazy, independent `has(value)` tracking.

```ts
import { createReactiveWeakSet } from "@solid-primitives/collections";

const active = createReactiveWeakSet(() => items().filter(item => item.active));
const seen = createReactiveWeakSet<object>(async function* (draft) {
  for await (const item of updates()) {
    draft.add(item);
    yield;
  }
});
```

The compute draft recieves a `WeakSet<T>`. It can mutate the draft and return/yield `void`, or return/yield an iterable replacement. Unlike regular Sets, WeakSets cannot be enumerated so they are not valid replacements or initial inputs. For the same reason, there is no iteration, size, or set algebra methods. Values must be `WeakKey`s, just like native `WeakSet`.

To support SSR, install the optional codec in the renderer:

```ts
import { WeakCollectionTokenPlugin } from "@solid-primitives/collections/serialization";

renderToStream(() => <App />, { plugins: [WeakCollectionTokenPlugin] });
```

Hydration preserves shared serializable key identities. Shared decoding reference tables may retain transported keys independently of the weak collection. See the [WeakMap factory documentation](#createreactiveweakmap) for renderer setup, garbage collection, metadata cleanup, and native-intrinsic limitations.

## Development

Tests, build configuration, and implementation notes live in this package. See the [validation guide](./docs/implementation.md#validation) and [weak storage/SSR notes](./docs/weak.md).
