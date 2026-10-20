# Reactive collection implementation

`createReactiveMap` and `createReactiveSet` use shallow Solid stores to provide independent per-key tracking, computed drafts, promises, async iterables, optimistic edits, and SSR/hydration. The existing `ReactiveMap` and `ReactiveSet` classes remain available. Weak variants share the computation model with a different storage representation; see [weak collections](./weak.md).

The public contracts and examples are in the [package README](../README.md).

## API and storage

- Iterable input returns `Map<K, V>` or `Set<T>`; compute input returns the corresponding `Refreshable` type.
- A compute receives an initially empty mutable draft. It can mutate the draft or return a readonly/native replacement, a PromiseLike of either result, or an AsyncIterable yielding either result.
- Compute options include `loadingValue`, `deferStream`, and `ssrSource`. Both input forms accept `name` and `optimistic`. An `ownedWrite` override is not exposed.
- Values are shallow and preserve identity. External mutations follow Solid batching; draft writes are immediately readable. Solid guards superseded and disposed async drafts.

Each entry occupies independently addressable store slots. Membership and value reads allocate separate lazy store nodes; a present-undefined value does not invalidate a `get` reader whose result remains undefined. Primitive keys encode directly. Objects, functions, and local symbols use weak identity registration, including aliases adopted during hydration.

Insertion order uses an immutable array of ordinals and slot names. Structural edits copy/filter the array in O(n); value-only edits do not touch it. This representation favors smaller code and faster replacements over logarithmic structural edits. Replacements preserve unchanged value/presence slots and start a fresh insertion generation when order changes. Size has its own slot so reordering does not invalidate size readers.

Iterators read the current store order when consumed. They advance by array index until the visible order changes, then binary-search after the last ordinal. Cursor snapshots contain slot names, never user keys or values. Explicit cursors inherit native iterator helpers without a `return()` method, so early loop exits leave them resumable. Key reads are untracked because order already tracks identity; value iteration reads only value slots. No per-entry ordinal slots or weak key cache are needed.

Values use frozen wrapper objects so shallow ingestion does not alter user objects. Negative zero is boxed as well, allowing a change from positive zero to invalidate a store value node. Value comparisons use `Object.is`; keys retain native SameValueZero semantics. The serializer handles shared identities and cycles through the backing store.

Strong and weak collections share the promise/async-iterable adapter and untracked draft writer in `src/compute.ts`. Separate writer and ordinal factories prevent long-lived closures from retaining initial iterables or obsolete loading seeds.

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

`test` runs server rendering before client hydration, then strong and weak lifetime suites in separate development/production processes with real GC. A failed server run prevents consumption of stale fixtures. The shared test runner discovers `test/*.test.*`; keeping this suite under `test/integration` lets the package runner select the right compiler/runtime conditions, generate fresh SSR fixtures before hydration, and enable GC for lifetime checks. Generated bundles and hydration fixtures stay under the ignored `node_modules/.cache` directory.

Coverage includes lazy node allocation/release, raw identity, native collection behavior and live iteration, deterministic differential tests with mixed keys and batched writes, signed-zero/NaN value equality, replacement order, errors, refresh, async supersession/disposal, held truth, optimistic rollback, shared serialized identities, structural edits after hydration, and strong/weak key/value lifetime.

To run lifetime checks alone or measure the current collection implementation:

```sh
pnpm test:gc
pnpm bench
```

The benchmarks bundle shipped production dependencies to avoid module-runner overhead. They report the median of three timed samples in milliseconds per operation, covering structural edits at 10/1,000/10,000 entries, a single edit among 1,000 observed values, primitive/object-key traversal, and derived replacements with and without optimism. Native Set provides a reference for structural edits and traversal; it does not perform reactive notification.

The array implementation was compared sequentially with the fixed AVL baseline on Node 24.18.0. With dependencies externalized, esbuild minification and tree-shaking reduced the Map/Set-only bundle from 7,165 to 5,998 bytes (gzip: 2,680 to 2,256); the complete main entry fell from 11,654 to 10,160 bytes (gzip: 3,889 to 3,381).

In that comparison, 1,000-entry reordered replacements improved from about 1.20 to 0.48 ms without optimism and 1.69 to 0.84 ms with optimism. Observed value writes stayed near 1.6 microseconds; value traversal improved from 115 to 72 microseconds. Removing the key cache made key traversal roughly 1.6–2 times slower. Numeric delete/reinsert rose from 4.3 to 9.5 microseconds at 1,000 entries and from 4.3 to 54 microseconds at 10,000 entries. This is the deliberate size tradeoff of the array representation; workloads dominated by large structural edits benefit from a tree index. Timings are local measurements, not performance guarantees.

## Storybook

Run from the repository root:

```sh
pnpm storybook
# or build a static preview:
pnpm build-storybook
```

Stories live under `stories/` and are discovered by the shared Storybook configuration, using the workspace dependencies.

Both Map and Set have basic, derived async, derived async iterable, derived async + optimistic, and weak-variant examples. Requests are simulated locally. The optimistic examples offer accepted and rejected saves; the streaming examples can be restarted while a previous stream is still running.
