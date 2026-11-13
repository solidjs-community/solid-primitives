# Reactive weak collection implementation

`createReactiveWeakMap` and `createReactiveWeakSet` support independent per-key reads, computed drafts, promises, async iterables, loading values, refresh, optimistic edits, and SSR/hydration.

The API and examples are in the [package README](../README.md).

## Weak storage and cleanup

A native WeakMap associates each key with an opaque property ID. The shallow store contains an independent value slot and weak key metadata for that ID. Each non-undefined value uses an immutable token containing a native `WeakMap<key, value>` and `WeakRef(key)`. A token retained by a snapshot or node does not keep its key, or a value-to-key cycle, alive. Replacing tokens preserves snapshot isolation.

Membership and value reads track separate store nodes. Undefined is stored directly so changing between a missing entry and a present-undefined entry does not invalidate `get(key)`. A metadata marker lets hydration adopt decoded key identities when the transported key set changes; ordinary mutations do not write that marker. There is no shared value signal through which all key reads are routed.

An old token can still retain its value if the key remains externally live. Solid must release obsolete companion nodes after reader disposal for overwritten/deleted values to become collectible. The lifetime suite covers both unreachable key cycles and obsolete values with live keys.

FinalizationRegistry callbacks queue only property IDs. Ordinary writes or a fresh compute drain this queue. Stale async drafts cannot drain it, since their guarded writes would do nothing. Ordinary optimistic writes also leave it queued, since a deletion through that path would roll back. Computed optimistic collections prune during the next authoritative computation.

Iterable-initialized optimistic collections have an internal maintenance projection driven by a key-free counter. This supplies an authoritative cleanup channel without sharing key subscriptions. Owner disposal disconnects its finalization callback. User keys/values can be collected before empty metadata is pruned; finalization timing is unspecified.

## API boundaries

- Initial inputs, replacements, and loading values must be iterable. Native WeakMap/WeakSet cannot be enumerated and are rejected as inputs/replacements. Mutating the supplied draft is the primary API.
- There is no size, enumeration, clear, or set algebra.
- Keys may be objects, functions, and supported non-registered symbols. Mutators reject primitive and registered-symbol keys. `WeakRef` and `FinalizationRegistry` are required.
- Values preserve identity. External writes follow Solid batching; draft edits are immediately readable.
- Independent existing-value edits can settle separately. Structural optimistic edits can settle together through Solid's root key-set node.
- Native intrinsics bypass the facade's methods. Its native internal storage is empty, and weak collections cannot be materialized by iteration.

## SSR and hydration

The optional serializer plugin is a separate entry so client collection code does not import the codec:

```ts
import { renderToStream } from "@solidjs/web";
import { WeakCollectionTokenPlugin } from "@solid-primitives/collections/serialization";

renderToStream(App, { plugins: [WeakCollectionTokenPlugin] });
```

The renderer's `plugins` option also supports `renderToString`. JSON transports need the plugin on both encoding and decoding sides. Script hydration reconstructs native weak containers directly and needs no client plugin registration. Missing plugin registration fails serialization rather than silently dropping weak state. These transport APIs are integration-facing in Solid and are outside its normal 2.0 stability guarantee.

The codec temporarily snapshots key/value pairs through the normal serializer, preserving cycles and identities shared with separately serialized keys. Already-collected keys become empty tokens. Hydrated lookups must use the transported key identity; an equal-looking object is a different key. Functions, local symbols, and unsupported values retain the transport's normal restrictions.

Static iterable seeds rebuild locally because Solid does not serialize synchronous seeds. Async fixtures and codec tests exercise transported entries, including promise/stream/hybrid/loading/client policies and hydration before or after the remaining stream arrives.

### Transport ownership

Solid/Seroval's script reference table and JSON decoder reference map can retain decoded keys independently of the weak collection. GC tests confirm that releasing those scopes lets the key/value cycle collect while its token remains alive.

The primitive cannot safely clear shared references: later chunks, late hydration, or other consumers may still need them. A renderer-level scope-release contract would be needed to automate that cleanup. JSON transports that discard their decoder after consumption already release that ownership. For strict weak lifetime immediately after hydration, `ssrSource: "client"` with an empty loading seed avoids transporting computed entries; separately serialized keys still have their own transport ownership.

## Validation and future core support

Run `pnpm test` from this package directory for the combined runtime, SSR, codec, and GC checks. The [validation guide](./implementation.md#validation) documents setup and individual commands. Weak coverage includes 21 runtime cases, 41 SSR/hydration/codec cases, and 40 lifetime cases in each shipped development/production profile.

No additional collection-specific core support is currently required. A safe authoritative maintenance operation could simplify cleanup, and an explicit opt-out from key-set observation could allow independent structural optimistic settlement. Exposing leaf signals alone would leave async, held-truth, optimistic, and hydration behavior to reconstruct, so the store backend remains the practical choice.
