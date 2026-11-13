<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Set" alt="Solid Primitives Set">
</p>

# @solid-primitives/set

[![size](https://img.shields.io/badge/size-780_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/set)
[![version](https://img.shields.io/npm/v/@solid-primitives/set?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/set)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive `Set` and `WeakSet` primitives, plus a suite of derived set-algebra operations.

| Export                                        | Type       | Description                                |
| --------------------------------------------- | ---------- | ------------------------------------------ |
| [`ReactiveSet`](#reactiveset)                 | `class`    | Drop-in reactive replacement for `Set`     |
| [`ReactiveWeakSet`](#reactiveweakset)         | `class`    | Drop-in reactive replacement for `WeakSet` |
| [`union`](#union)                             | `function` | Elements in `a` or `b`                     |
| [`intersection`](#intersection)               | `function` | Elements in both `a` and `b`               |
| [`difference`](#difference)                   | `function` | Elements in `a` not in `b`                 |
| [`symmetricDifference`](#symmetricdifference) | `function` | Elements in `a` or `b`, but not both       |
| [`readonlySet`](#readonlyset)                 | `function` | Cast a `ReactiveSet` to `ReadonlySet`      |

> For computed, async, and optimistic collections, see [`@solid-primitives/collections`](../collections/README.md).

## Installation

```bash
npm install @solid-primitives/set
# or
yarn add @solid-primitives/set
# or
pnpm add @solid-primitives/set
```

## `ReactiveSet`

A drop-in reactive replacement for the built-in `Set` class. All reads — `has()`, `size`, iteration — are reactive. All writes — `add()`, `delete()`, `clear()` — notify only the affected subscribers. Iteration methods (`values()`, `keys()`, `entries()`, `[Symbol.iterator]()`) subscribe when called, not when the returned iterator is advanced.

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveSet } from "@solid-primitives/set";

const FRUITS = ["apple", "banana", "cherry", "fig"];

function Demo() {
  const set = new ReactiveSet(["apple", "cherry"]);
  return (
    <>
      {FRUITS.map(fruit => (
        <button onClick={() => (set.has(fruit) ? set.delete(fruit) : set.add(fruit))}>
          {set.has(fruit) ? "✓" : "✗"} {fruit}
        </button>
      ))}
      <button onClick={() => set.clear()}>clear</button>
      <p>size: {set.size}</p>
      <p>members: {[...set].join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveWeakSet } from "@solid-primitives/set";

const users = [{ name: "Ada" }, { name: "Grace" }, { name: "Linus" }];

function Demo() {
  const selected = new ReactiveWeakSet<{ name: string }>();
  return (
    <ul>
      {users.map(user => (
        <li>
          <label>
            <input
              type="checkbox"
              checked={selected.has(user)}
              onChange={e => (e.currentTarget.checked ? selected.add(user) : selected.delete(user))}
            />
            {user.name} — selected: {String(selected.has(user))}
          </label>
        </li>
      ))}
    </ul>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveSet, union } from "@solid-primitives/set";

function Demo() {
  const a = new ReactiveSet([1, 2, 3]);
  const b = new ReactiveSet([2, 3, 4]);
  const result = union(a, b);
  return (
    <>
      <p>A: {[...a].join(", ")}</p>
      {[1, 2, 3, 4, 5].map(n => (
        <button onClick={() => (b.has(n) ? b.delete(n) : b.add(n))}>B ± {n}</button>
      ))}
      <p>B: {[...b].join(", ")}</p>
      <p>union: {[...result()].join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const u = union(a, b);
u(); // => Set {1, 2, 3, 4}

a.add(5);
// after flush:
u(); // => Set {1, 2, 3, 4, 5}
```

### `intersection`

Elements that appear in both `a` and `b`.

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveSet, intersection } from "@solid-primitives/set";

function Demo() {
  const a = new ReactiveSet([1, 2, 3]);
  const b = new ReactiveSet([2, 3, 4]);
  const result = intersection(a, b);
  return (
    <>
      <p>A: {[...a].join(", ")}</p>
      {[1, 2, 3, 4, 5].map(n => (
        <button onClick={() => (b.has(n) ? b.delete(n) : b.add(n))}>B ± {n}</button>
      ))}
      <p>B: {[...b].join(", ")}</p>
      <p>intersection: {[...result()].join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const i = intersection(a, b);
i(); // => Set {2, 3}
```

### `difference`

Elements in `a` that do not appear in `b`.

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveSet, difference } from "@solid-primitives/set";

function Demo() {
  const a = new ReactiveSet([1, 2, 3]);
  const b = new ReactiveSet([2, 3, 4]);
  const result = difference(a, b);
  return (
    <>
      <p>A: {[...a].join(", ")}</p>
      {[1, 2, 3, 4, 5].map(n => (
        <button onClick={() => (b.has(n) ? b.delete(n) : b.add(n))}>B ± {n}</button>
      ))}
      <p>B: {[...b].join(", ")}</p>
      <p>difference: {[...result()].join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const d = difference(a, b);
d(); // => Set {1}
```

### `symmetricDifference`

Elements in `a` or `b`, but not both.

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveSet, symmetricDifference } from "@solid-primitives/set";

function Demo() {
  const a = new ReactiveSet([1, 2, 3]);
  const b = new ReactiveSet([2, 3, 4]);
  const result = symmetricDifference(a, b);
  return (
    <>
      <p>A: {[...a].join(", ")}</p>
      {[1, 2, 3, 4, 5].map(n => (
        <button onClick={() => (b.has(n) ? b.delete(n) : b.add(n))}>B ± {n}</button>
      ))}
      <p>B: {[...b].join(", ")}</p>
      <p>symmetricDifference: {[...result()].join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const s = symmetricDifference(a, b);
s(); // => Set {1, 4}
```

## `readonlySet`

Casts a `ReactiveSet` to `ReadonlySet` at the type level. No runtime cost — returns the same instance. Useful for exposing an internal set from a primitive without allowing callers to mutate it directly.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { ReactiveSet, readonlySet } from "@solid-primitives/set";

function createTagList() {
  const tags = new ReactiveSet<string>(["solid"]);
  return { tags: readonlySet(tags), add: (tag: string) => tags.add(tag) };
}

function Demo() {
  const list = createTagList();
  const [draft, setDraft] = createSignal("");
  return (
    <>
      <input value={draft()} onInput={e => setDraft(e.currentTarget.value)} />
      <button
        onClick={() => {
          const tag = draft().trim();
          if (tag) list.add(tag);
          setDraft("");
        }}
      >
        add tag
      </button>
      {/* list.tags.add(...) would be a TypeScript error */}
      <p>
        tags ({list.tags.size}): {[...list.tags].join(", ")}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { readonlySet } from "@solid-primitives/set";

function createTodoList() {
  const _todos = new ReactiveSet<string>();
  return {
    todos: readonlySet(_todos),
    add(todo: string) {
      _todos.add(todo);
    },
    remove(todo: string) {
      _todos.delete(todo);
    },
  };
}

const list = createTodoList();
list.todos.has("buy milk"); // ok
list.todos.add("buy milk"); // TypeScript error
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
