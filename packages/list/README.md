<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=list" alt="Solid Primitives list">
</p>

# @solid-primitives/list

[![docs](https://img.shields.io/badge/-docs%20%26%20demos-blue?style=for-the-badge)](https://primitives.solidjs.community/package/list)
[![size](https://img.shields.io/badge/size-774_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/list)
[![version](https://img.shields.io/npm/v/@solid-primitives/list?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/list)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A control-flow component and underlying helper for iterating over arrays. Provides additional `recycle` option. If enabled, the mapped elements are reused.
`<List>` is based on `<For>` and has all of it's functionalities, but it can also recycle elements. The examples are interchangeable with `<For>`, wherever `recycle` is not used.

- [`List`](#list) — Component that provides additional `recycle` option besides standard `For` functionality.
- [`listArray`](#listarray) — The underlying reactive array mapper that powers `<List>`, usable outside JSX.

## Installation

```bash
npm install @solid-primitives/list
# or
pnpm add @solid-primitives/list
```

## Keyed vs Unkeyed vs Recycled

`<List recycle>` is the middleground between keyed and unkeyed. It's keyed for elements that are reordered and it's unkeyed for elements that are replaced. Recycling can also reorder and replace an element simultaneously, to maximize reusability.

|                        | Keyed `<List>`        | Unkeyed `<List keyed={false}>`          | Recycled `<List recycle>`            |
| ---------------------- | --------------------- | --------------------------------------- | ------------------------------------ |
| **Keyed by**           | value identity        | position                                | value identity (priority) + position |
| **On value change**    | recreate element      | change value                            | change value                         |
| **On position change** | reorder elements      | change values at all affected positions | reorder elements                     |
| **Best for**           | reorderable read-only | static editable                         | reorderable editable                 |

### Keyed `<List>`

Creates one element per unique value and tracks it by identity. If `"alice"` moves from index 0 to index 2, the element is reused and its `index()` updates. If the value at a position changes from `"alice"` to `"bob"`, the `"alice"` element is destroyed and a new `"bob"` element is created.

```tsx
// The render function re-runs whenever an item is new to the array.
// index() is reactive; item value is fixed per element.
<List each={items()}>{(item, index) => <Row label={item} position={index()} />}</List>
```

#### When to use:

- **Reorderable read-only** - If the items don't change, but might reorder. However if the elements change often and destroying / creating element is slower than updating value, then it's better to avoid it.
- **Animations** - If the animations rely on element persistence. When you replace an item, it is destroyed (leaving) and recreated (entering), it also can be reordered (moving).

### Unkeyed `<List keyed={false}>`

Creates one element per slot (index) and keeps elements fixed to their position. If a value moves from index 0 to index 2, the element at position 0 is updated with the new value and the element at position 2 is also updated — no element moves, but two `item()` signals fire.

```tsx
// The render function re-runs whenever a new slot is created (array grows).
// item() is reactive; position is fixed per element.
<List keyed={false} each={items()}>
  {(item, index) => <Row label={item()} position={index} />}
</List>
```

#### When to use:

- **Static editable** - If the items change often, but stay in place (don't reorder). However if the elements do reorder or are for example prepended, then every value in the list has to be updated - in this case it's better to avoid it.

### Recycle `<List recycle>`

`<List>` combines both reactive accessors. The render function runs **only when the array grows**. When a value moves to a new position only its `index()` fires. When a value changes at a position only its `item()` fires. In both cases the element is reused, not recreated.

```tsx
// The render function runs only when a truly new element is needed.
// Both item() and index() are reactive.
<List recycle each={items()}>
  {(item, index) => <Row label={item()} position={index()} />}
</List>
```

#### When to reach for `<List>`

- **Reorderable editable** — If the items change and might reorder. It handles both of these cases, but if there are persistance reliant animations, leaving and entering wouldn't be triggered on item replace. Also if there are multiple of the same values and some of them change, this might trigger unexpected reordering which usually is slower than just updating the values - in this case unkeyed could be more efficient.

## Recycle `List`

```tsx
import { List } from "@solid-primitives/list";

function Component() {
  const [items, setItems] = createSignal(["alice", "bob", "carol"]);

  return (
    <List recycle each={items()} fallback={<p>No items.</p>}>
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

| Prop       | Type                                                                                                                                                                                      | Description                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `each`     | `T[] \| undefined \| null \| false`                                                                                                                                                       | The source array. Falsy values are treated as empty.                                                           |
| `fallback` | `JSX.Element \| undefined`                                                                                                                                                                | Rendered when `each` is empty or falsy.                                                                        |
| `children` | `(value: T, index: Accessor<number>) => JSX.Element)` <br /> `(value: Accessor<T>, index: number) => JSX.Element)` <br /> `(value: Accessor<T>, index: Accessor<number>) => JSX.Element)` | Render function, called once per new element. The argument types depend on options, see [types](#types) below. |
| `recycle`  | `boolean \| undefined`                                                                                                                                                                    | Set to `true` for list to reuse elements.                                                                      |
| `keyed`    | `boolean \| (item: T) => any \| undefined`                                                                                                                                                | Custom key function to match elements or `false` for unkeyed flow. Works exactly like in `<For>`.              |

### Types

The render function can use reactive index, reactive value or both depending on `keyed` and `recycle` options. The reactive argument is of type `Accessor<...>`. The reactivity of argument is presented in table below:

| Argument reactivity        | `recycle: undefined \| false` | `recycle: true` |
| -------------------------- | ----------------------------- | --------------- |
| `keyed: false`             | 🟢⚪ Value                    | 🟢⚪ Value      |
| `keyed: undefined \| true` | ⚪🟢 Index                    | 🟢🟢 Both       |
| `keyed: (item: T) => any`  | 🟢🟢 Both                     | 🟢🟢 Both       |

Note that when `keyed: false` there won't be any reordering, so index doesn't need to be reactive. Ultimately `<List keyed={false} recycle>` would be just unkeyed.

### Reactivity guarantees of recycling

- The `children` render function is called **only when a new element is created** (i.e. the array has grown beyond its previous maximum length).
- When an item **moves** to a new position, only its `index()` signal fires — no re-render.
- When a value **changes** at a position, only its `item()` signal fires — no re-render.
- Elements are **disposed** only when the array shrinks below the number of live elements.

## `listArray`

`listArray` is the reactive array mapper that backs `<List>`. Use it directly when you need the same reconciliation behaviour outside of JSX — inside a store derivation, a custom hook, or alongside other reactive primitives.

```ts
import { listArray } from "@solid-primitives/list";

const rows = listArray(
  items,
  (item, index) => ({
    label: () => `${index() + 1}. ${item().name}`,
    score: () => item().score,
  }),
  { recycle: true },
);

// rows() returns the current array of mapped objects.
// Each object is stable across reorders and value updates.
```

The `mapFn` receives the same stable reactive accessors as `<List>`'s render function. It is called only when a new element needs to be created; subsequent value or index changes are pushed through the existing accessors.

### Signature

```ts
export function listArray<Item, MappedItem>(
  list: Accessor<Maybe<readonly Item[]>>,
  map:
    | ((value: Item, index: Accessor<number>) => MappedItem)
    | ((value: Accessor<Item>, index: number) => MappedItem)
    | ((value: Accessor<Item>, index: Accessor<number>) => MappedItem),
  options?: {
    keyed?: boolean | ((item: Item) => any);
    recycle?: boolean;
    fallback?: Accessor<any>;
    name?: string;
  },
): Accessor<MappedItem[]>;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
