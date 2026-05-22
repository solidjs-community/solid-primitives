---
"@solid-primitives/set": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

## New Exports

- **`union(a, b)`** — reactive `Accessor<ReadonlySet<T>>` of all elements in either set.
- **`intersection(a, b)`** — reactive `Accessor<ReadonlySet<T>>` of elements present in both sets.
- **`difference(a, b)`** — reactive `Accessor<ReadonlySet<T>>` of elements in `a` not in `b`.
- **`symmetricDifference(a, b)`** — reactive `Accessor<ReadonlySet<T>>` of elements in either set but not both.
- **`readonlySet(set)`** — casts a `ReactiveSet` to `ReadonlySet` (type-only, zero runtime cost).
