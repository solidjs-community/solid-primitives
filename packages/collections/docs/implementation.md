# Reactive collection implementation

`createReactiveMap` and `createReactiveSet` use shallow Solid stores to provide independent per-key tracking, computed drafts, promises, async iterables, optimistic edits, and SSR/hydration. The existing `ReactiveMap` and `ReactiveSet` classes remain available. Weak variants share the computation model with a different storage representation; see [weak collections](./weak.md).

The public contracts and examples are in the [package README](../README.md).

## API and storage

- Iterable input returns `Map<K, V>` or `Set<T>`; compute input returns the corresponding `Refreshable` type.
- A compute receives an initially empty mutable draft. It can mutate the draft or return a readonly/native replacement, a PromiseLike of either result, or an AsyncIterable yielding either result.
- Compute options include `loadingValue`, `deferStream`, and `ssrSource`. Both input forms accept `name` and `optimistic`. An `ownedWrite` override is not exposed.
- Values are shallow and preserve identity. External mutations follow Solid batching; draft writes are immediately readable. Solid guards superseded and disposed async drafts.

Each entry occupies independently addressable store slots. Membership and value reads allocate separate lazy store nodes; a present-undefined value does not invalidate a `get` reader whose result remains undefined. Primitive keys encode directly. Objects, functions, and local symbols use weak identity registration, including aliases adopted during hydration.

Insertion order uses an immutable AVL tree of ordinals and slot names. Structural edits copy a logarithmic path rather than an entire ordered-key array. This does not guarantee logarithmic optimistic writes: Solid can still copy/diff its backing state. Replacements preserve unchanged value/presence slots and start a fresh insertion generation when order changes.

Iterators read the current store order when consumed. They advance with a stack until the visible root changes, then seek after the last ordinal. Weak key caches prevent historical iterator trees from retaining deleted object keys. Values use frozen wrapper objects so shallow ingestion does not alter user objects. The serializer handles shared identities and cycles through the backing store.

The implementation uses public Solid APIs. Private node inspections and projection-trace inspection through `solid-js/internal` occur only in tests.

## Behavioral boundaries

- Optimistic value edits to independent Map keys settle independently. Structural edits can settle together through Solid's shared key-set node.
- Iterators do not rewind on optimistic rollback. Order-changing replacements act as a new insertion generation.
- The facade has empty native internal storage. Use `new Map(map)` / `new Set(set)` with native intrinsics, structured cloning, or serializers that bypass instance methods.
- Functions and local symbols are supported on the client but are not generally wire-serializable. Local-symbol bookkeeping requires runtime support for weak symbol keys.
- Correct live traversal costs more than native traversal; keep this in mind for iteration-heavy workloads.

## Validation

Install the workspace dependencies before running the package checks. Runtime tests, type checking, and Storybook use the installed Solid packages.

From this package directory:

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

`test` runs server rendering before client hydration, then the weak lifetime suite in separate development/production processes with real GC. A failed server run prevents consumption of stale fixtures. The shared test runner discovers `test/*.test.*`; keeping this suite under `test/integration` lets the package runner select the right compiler/runtime conditions, generate fresh SSR fixtures before hydration, and enable GC for lifetime checks. Generated bundles and hydration fixtures stay under the ignored `node_modules/.cache` directory.

Coverage includes lazy node allocation/release, raw identity, native collection behavior and live iteration, a deterministic 2,000-operation comparison with native Map, replacement order, errors, refresh, async supersession/disposal, held truth, optimistic rollback, shared serialized identities, delayed hydration, and weak-key/value lifetime.

To run lifetime checks alone or measure the current collection implementation:

```sh
pnpm test:gc
pnpm bench
```

The benchmarks cover structural edits, a single edit among 1,000 observed values, and full traversal. Native Set provides a reference for structural edits and traversal; it does not perform reactive notification.

## Storybook

Run from the repository root:

```sh
pnpm storybook
# or build a static preview:
pnpm build-storybook
```

Stories live under `stories/` and are discovered by the shared Storybook configuration, using the workspace dependencies.

Both Map and Set have basic, derived async, derived async iterable, derived async + optimistic, and weak-variant examples. Requests are simulated locally. The optimistic examples offer accepted and rejected saves; the streaming examples can be restarted while a previous stream is still running.
