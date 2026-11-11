<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Map" alt="Solid Primitives Map">
</p>

# @solid-primitives/map

[![size](https://img.shields.io/badge/size-747_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/map)
[![version](https://img.shields.io/npm/v/@solid-primitives/map?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/map)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

The reactive versions of `Map` & `WeakMap` built-in data structures.

- **[`ReactiveMap`](#reactivemap)** - A reactive `Map`.
- **[`ReactiveWeakMap`](#reactiveweakmap)** - A reactive `WeakMap`.

## Installation

```bash
npm install @solid-primitives/map
# or
yarn add @solid-primitives/map
# or
pnpm add @solid-primitives/map
```

## `ReactiveMap`

A reactive `Map`. Read methods subscribe to reactive updates when called inside a tracking scope (JSX, `createMemo`, `createEffect` compute). Write methods notify only the subscribers affected by the change.

### Usage

```tsx
import { ReactiveMap } from "@solid-primitives/map";

const userPoints = new ReactiveMap<User, number>();

// Reads are tracked reactively in JSX:
function Scoreboard() {
  return (
    <div>
      <p>Points: {userPoints.get(user1)}</p>
      <p>Has user: {String(userPoints.has(user1))}</p>
      <p>Total users: {userPoints.size}</p>
    </div>
  );
}

// Or derive values with createMemo:
const points = createMemo(() => userPoints.get(user1));
const hasUser = createMemo(() => userPoints.has(user1));

// Apply changes anywhere — writes are automatically batched:
userPoints.set(user1, 100);
userPoints.delete(user2);
userPoints.set(user1, { foo: "bar" });
```

### Constructor

Takes one optional argument — an iterable of `[key, value]` pairs:

```ts
const map = new ReactiveMap([
  ["foo", [1, 2, 3]],
  ["bar", [3, 4, 5]],
]);
```

### Tracking semantics

Reads are tracked at two independent granularities, so components only re-run for the exact change they care about:

| Method                   | Re-runs when…                                  |
| ------------------------ | ---------------------------------------------- |
| `has(key)`               | That key is added or removed                   |
| `get(key)`               | That key's value changes (by reference)        |
| `size`                   | Any key is added or removed                    |
| `keys()`                 | Any key is added or removed                    |
| `values()`               | Any value changes, or any key is added/removed |
| `entries()`, `forEach()` | Any key or value changes                       |

**Setting the same value is a no-op.** `map.set(k, map.get(k))` does not notify any subscribers.

**`clear()` only notifies subscribers of keys that were in the map.** Observers of non-existent keys are not triggered.

### Values are shallowly tracked

Values are compared by reference. Mutating an object stored in the map will not trigger updates — call `.set()` with a new reference to notify subscribers:

```ts
const map = new ReactiveMap<string, { age: number }>();
map.set("John", { age: 34 });

// won't trigger any updates:
map.get("John").age = 35;

// will trigger:
map.set("John", { age: 35 });
```

## `ReactiveWeakMap`

A reactive `WeakMap`. Same per-key tracking as `ReactiveMap` for `has(key)` and `get(key)`, but keys must be object references.

Does not support `size`, `clear()`, or any iteration method — these are absent on the native `WeakMap` to allow keys to be garbage-collected when no other reference exists.

### Usage

```tsx
import { ReactiveWeakMap } from "@solid-primitives/map";

const selected = new ReactiveWeakMap<Item, boolean>();

function Row(props: { item: Item }) {
  return (
    <div style={{ background: selected.get(props.item) ? "blue" : "none" }}>
      <button onClick={() => selected.set(props.item, true)}>Select</button>
    </div>
  );
}
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
