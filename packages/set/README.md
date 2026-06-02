<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Set" alt="Solid Primitives Set">
</p>

# @solid-primitives/set

[![size](https://img.shields.io/badge/size-852_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/set)
[![version](https://img.shields.io/npm/v/@solid-primitives/set?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/set)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive `Set` and `WeakSet` primitives, plus a suite of derived set-algebra operations.

| Export | Type | Description |
|---|---|---|
| [`ReactiveSet`](#reactiveset) | `class` | Drop-in reactive replacement for `Set` |
| [`ReactiveWeakSet`](#reactiveweakset) | `class` | Drop-in reactive replacement for `WeakSet` |
| [`union`](#union) | `function` | Elements in `a` or `b` |
| [`intersection`](#intersection) | `function` | Elements in both `a` and `b` |
| [`difference`](#difference) | `function` | Elements in `a` not in `b` |
| [`symmetricDifference`](#symmetricdifference) | `function` | Elements in `a` or `b`, but not both |
| [`readonlySet`](#readonlyset) | `function` | Cast a `ReactiveSet` to `ReadonlySet` |

## Installation

```bash
npm install @solid-primitives/set
# or
yarn add @solid-primitives/set
# or
pnpm add @solid-primitives/set
```

## `ReactiveSet`

A drop-in reactive replacement for the built-in `Set` class. All reads — `has()`, `size`, iteration — are reactive. All writes — `add()`, `delete()`, `clear()` — notify only the affected subscribers.

```ts
import { ReactiveSet } from "@solid-primitives/set";

const set = new ReactiveSet([1, 2, 3]);

// reads inside a reactive context track changes automatically
createEffect(
  () => [...set],
  values => console.log(values), // re-runs whenever the set contents change
);
createEffect(
  () => set.has(2),
  exists => console.log(exists), // re-runs only when the presence of 2 changes
);

// mutate like a normal Set
set.add(4);
set.delete(2);
set.clear();
```

`has()` tracks at the key level — adding or removing an unrelated element will not re-run a `has()` subscriber.

## `ReactiveWeakSet`

A drop-in reactive replacement for `WeakSet`. Only `has()` is reactive; there is no size or iteration (matching the `WeakSet` contract).

```ts
import { ReactiveWeakSet } from "@solid-primitives/set";

const set = new ReactiveWeakSet<object>();

createEffect(
  () => set.has(myObj),
  present => console.log(present),
);

set.add(myObj);
set.delete(myObj);
```

## Set algebra operations

All four operations accept any `ReadonlySet<T>` — pass a `ReactiveSet` and the derived value re-computes automatically whenever the input changes.

```ts
import { union, intersection, difference, symmetricDifference } from "@solid-primitives/set";

const a = new ReactiveSet([1, 2, 3]);
const b = new ReactiveSet([2, 3, 4]);
```

Each operation must be called inside a reactive owner (a component, `createRoot`, or similar) because it creates a `createMemo` internally.

### `union`

Elements that appear in `a`, `b`, or both.

```ts
const u = union(a, b);
u(); // => Set {1, 2, 3, 4}

a.add(5);
// after flush:
u(); // => Set {1, 2, 3, 4, 5}
```

### `intersection`

Elements that appear in both `a` and `b`.

```ts
const i = intersection(a, b);
i(); // => Set {2, 3}
```

### `difference`

Elements in `a` that do not appear in `b`.

```ts
const d = difference(a, b);
d(); // => Set {1}
```

### `symmetricDifference`

Elements in `a` or `b`, but not both.

```ts
const s = symmetricDifference(a, b);
s(); // => Set {1, 4}
```

## `readonlySet`

Casts a `ReactiveSet` to `ReadonlySet` at the type level. No runtime cost — returns the same instance. Useful for exposing an internal set from a primitive without allowing callers to mutate it directly.

```ts
import { readonlySet } from "@solid-primitives/set";

function createTodoList() {
  const _todos = new ReactiveSet<string>();
  return {
    todos: readonlySet(_todos),
    add(todo: string) { _todos.add(todo); },
    remove(todo: string) { _todos.delete(todo); },
  };
}

const list = createTodoList();
list.todos.has("buy milk"); // ok
list.todos.add("buy milk"); // TypeScript error
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
