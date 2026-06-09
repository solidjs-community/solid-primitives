<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=list" alt="Solid Primitives list">
</p>

# @solid-primitives/list

[![docs](https://img.shields.io/badge/-docs%20%26%20demos-blue?style=for-the-badge)](https://primitives.solidjs.community/package/list)
[![size](https://img.shields.io/badge/size-774_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/list)
[![version](https://img.shields.io/npm/v/@solid-primitives/list?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/list)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A control-flow component and underlying helper for iterating over arrays where **both** the item value and its position can change independently — without recreating elements.

- [`List`](#list) — Component that provides a reactive `item` accessor and a reactive `index` accessor per element.
- [`listArray`](#listarray) — The underlying reactive array mapper that powers `<List>`, usable outside JSX.

## Installation

```bash
npm install @solid-primitives/list
# or
pnpm add @solid-primitives/list
```

## Comparison with `<For>` and `<Index>`

Solid ships with two built-in list primitives. `<List>` sits between them and is the right choice when both values and positions can change.

| | `<For>` | `<Index>` | `<List>` |
|---|---|---|---|
| **Keyed by** | value identity | position | value identity (priority) + position |
| **`item` accessor** | static (re-runs on change) | reactive | reactive |
| **`index` accessor** | reactive | static (re-runs on change) | reactive |
| **Element recreated when…** | value is new to the array | array grows | array grows |
| **Best for** | stable values that move | stable positions with changing values | both values and positions change |

### `<For>` — keyed by value

`<For>` creates one element per unique value and tracks it by identity. If `"alice"` moves from index 0 to index 2, the element is reused and its `index()` updates. If the value at a position changes from `"alice"` to `"bob"`, the `"alice"` element is destroyed and a new `"bob"` element is created.

```tsx
// The render function re-runs whenever an item is new to the array.
// index() is reactive; item value is fixed per element.
<For each={items()}>
  {(item, index) => <Row label={item} position={index()} />}
</For>
```

### `<Index>` — keyed by position

`<Index>` creates one element per slot (index) and keeps elements fixed to their position. If a value moves from index 0 to index 2, the element at position 0 is updated with the new value and the element at position 2 is also updated — no element moves, but two `item()` signals fire.

```tsx
// The render function re-runs whenever a new slot is created (array grows).
// item() is reactive; position is fixed per element.
<Index each={items()}>
  {(item, index) => <Row label={item()} position={index} />}
</Index>
```

### `<List>` — keyed by value, with reactive index

`<List>` combines both reactive accessors. The render function runs **only when the array grows**. When a value moves to a new position only its `index()` fires. When a value changes at a position only its `item()` fires. In both cases the element is reused, not recreated.

```tsx
// The render function runs only when a truly new element is needed.
// Both item() and index() are reactive.
<List each={items()}>
  {(item, index) => <Row label={item()} position={index()} />}
</List>
```

### When to reach for `<List>`

- **Sortable / reorderable lists** — items change position frequently; you want index badges or position-dependent styles to update without tearing down the element.
- **Editable lists** — values are replaced in place; you want the element to survive the update so local state (focus, animation, scroll position) is preserved.
- **Both at once** — a list that is both reordered and edited, where `<For>` would recreate on value change and `<Index>` would update the wrong element's signal on reorder.

If your list is read-only and never reordered, `<For>` is simpler and sufficient. If positions never change but values do (e.g. a live feed in a fixed number of slots), `<Index>` is the right fit.

## `List`

```tsx
import { List } from "@solid-primitives/list";

function Component() {
  const [items, setItems] = createSignal(["alice", "bob", "carol"]);

  return (
    <List each={items()} fallback={<p>No items.</p>}>
      {(item, index) => (
        <div>
          #{index() + 1} — {item()}
        </div>
      )}
    </List>
  );
}
```

### Props

| Prop | Type | Description |
|---|---|---|
| `each` | `T[] \| undefined \| null \| false` | The source array. Falsy values are treated as empty. |
| `fallback` | `JSX.Element` | Rendered when `each` is empty or falsy. |
| `children` | `(item: Accessor<T>, index: Accessor<number>) => JSX.Element` | Render function, called once per new element. |

### Reactivity guarantees

- The `children` render function is called **only when a new element is created** (i.e. the array has grown beyond its previous maximum length).
- When an item **moves** to a new position, only its `index()` signal fires — no re-render.
- When a value **changes** at a position, only its `item()` signal fires — no re-render.
- Elements are **disposed** only when the array shrinks below the number of live elements.

## `listArray`

`listArray` is the reactive array mapper that backs `<List>`. Use it directly when you need the same reconciliation behaviour outside of JSX — inside a store derivation, a custom hook, or alongside other reactive primitives.

```ts
import { listArray } from "@solid-primitives/list";

const rows = listArray(items, (item, index) => ({
  label: () => `${index() + 1}. ${item().name}`,
  score: () => item().score,
}));

// rows() returns the current array of mapped objects.
// Each object is stable across reorders and value updates.
```

The `mapFn` receives the same stable reactive accessors as `<List>`'s render function. It is called only when a new element needs to be created; subsequent value or index changes are pushed through the existing accessors.

### Signature

```ts
function listArray<T, U>(
  list: Accessor<readonly T[] | undefined | null | false>,
  mapFn: (value: Accessor<T>, index: Accessor<number>) => U,
  options?: { fallback?: Accessor<JSX.Element> },
): () => U[]
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
