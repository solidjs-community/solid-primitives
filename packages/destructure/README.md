# @solid-primitives/destructure

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/destructure?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/destructure)
[![version](https://img.shields.io/npm/v/@solid-primitives/destructure?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/destructure)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Primitives for destructuring reactive objects _– like props or stores –_ and signals into a tuple/map of separate accessors.

- **[`spread`](#spread)** - Spread a reactive object source **eagerely**.
- **[`destructure`](#destructure)** - Destructure a reactive object source **lazily**.

## Installation

```bash
npm install @solid-primitives/destructure
# or
yarn add @solid-primitives/destructure
```

## `spread`

Spreads an reactive object _(store or props)_ or a reactive object signal into a tuple/map of signals for each object key. **All the keys are eagerly spread**, so the source object needs to have static keys or only the kays available when spreading should be used.

#### Import

```ts
import { spread } from "@solid-primitives/destructure";
```

#### Basic usage

```ts
// spread tuples
const [first, second, third] = spread(() => [1, 2, 3]);
first(); // => 1
second(); // => 2
third(); // => 3

// spread objects
const { name, age } = spread({ name: "John", age: 36 });
name(); // => "John"
age(); // => 36
```

#### Spread component props

```tsx
const ListItem: Component<{ title: string; label: string; highlight: boolean }> = props => {
  const { title, label, highlight } = spread(props);
  return <h2>{title()}</h2>;
};
```

#### Spread signals

If you pass the source as a function, `spread` will create memos for individual keys, to track them seperately.

```ts
const [user, setUser] = createSignal({
  name: "John",
  lastName: "Brown",
  age: 25
});
const { name, lastName, age } = spread(user);
name(); // => "John"
```

#### Caching keys

By default keys of an accessor source are **cached** and keys of an object source **are not**. _(reactive objet like stores and props should be fine-grained anyway)_ But caching can be controlled by specifying a `cache` property in options.

```ts
const [store, setStore] = createStore({
  user: {
    name: "John",
    lastName: "Brown",
    age: 25
  }
});
// disable caching (for accessors is enabled by default)
const { name, lastName, age } = spread(() => store.user, { cache: false });
```

## `destructure`

`destructure` primitive has the same goal and usage as [`spread`](#spread), but the properties of the source object are **lazily accessed**, which comes with a range of tradeoffs, described below:

#### Import

```ts
import { destructure } from "@solid-primitives/destructure";
```

### Differences to `spread`

#### Accessing keys that are missing initially

`destructure` allows for getting hold of accessors to keys that are not in the object yet, while still being reactive, and updating when that key will be added.

```ts
const [user, setUser] = createSignal({
  name: "John",
  lastName: "Brown"
});
const { age } = destructure(user);
age(); // => undefined (not an error though)

setUser(p => ({
  ...p,
  age: 34
}));
age(); // => 34
```

#### Caching only used properties

When [caching](#caching-keys) is enabled, `spread` will create memos for each key, regardless of if it was accessed or not. As `destructure` waits for your read, the memos are created only for accessed keys.

```ts
const [user, setUser] = createSignal({
  name: "John",
  lastName: "Brown",
  age: 25
});
// only the `age` key will be cached
const { age } = destructure(user);
```

#### No spreading

No `{...obj}` or `[...list]` is possible with `destructure`, all the keys have to accessed directly.

For objects this mostly doesn't matter, as this is still possible:

```ts
const { a, b } = destructure({ a: 123, b: "foo" });
```

But for lists:

```ts
// DO NOT do this:
const [a, b] = destructure([1, 2]);

// Do this instead:
const list = destructure([1, 2]);
const a = list[0];
const b = list[1];
```

## Acknowledgements

- This package was initially based on the implementation of `spread` and `destructure` in [solid-use](https://github.com/LXSMNSYC/solid-use).

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release of the destructure package.

</details>
