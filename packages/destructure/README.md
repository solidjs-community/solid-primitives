# @solid-primitives/destructure

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/destructure?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/destructure)
[![version](https://img.shields.io/npm/v/@solid-primitives/destructure?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/destructure)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Primitives for destructuring reactive objects _– like props or stores –_ or signals of them into a separate accessors updated individually.

- **[`destructure`](#destructure)** - Destructure a reactive object into map/tuple of signals.
- **[`wrapGetters`](#wrapGetters)** - Access properties of an object signal like a store.

## Installation

```bash
npm install @solid-primitives/destructure
# or
yarn add @solid-primitives/destructure
```

## `destructure`

Spreads an reactive object _(store or props)_ or a reactive object signal into a tuple/map of signals for each object key.

#### Import

```ts
import { spread } from "@solid-primitives/destructure";
```

#### How to use it

`destructure` is an reactive primitive, hence needs to be used under an reactive root. Pass an reactive object or a signal as it's first argument, and configure it's behavior via options:

- `cache` - wraps accessors in `createMemo`, making each property update independently. _(enabled by default for signal source)_
- `lazy` - property accessors are created on key read. enable if you want to only a subset of source properties, or use properties initially missing
- `deep` - destructure nested objects

```ts
// spread tuples
const [first, second, third] = destructure(() => [1, 2, 3]);
first(); // => 1
second(); // => 2
third(); // => 3

// spread objects
const { name, age } = destructure({ name: "John", age: 36 });
name(); // => "John"
age(); // => 36
```

#### Spread component props

```tsx
const ListItem: Component<{ title: string; label: string; highlight: boolean }> = props => {
  const { title, label, highlight } = destructure(props);
  return <h2>{title()}</h2>;
};
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
const { name, lastName, age } = destructure(() => store.user, { cache: false });
```

#### Destructuring nested objects

The `deep` flag causes the all the nested objects to be destructured into signals as well.

```ts
const [store, setStore] = createStore({
  user: {
    name: "Johnny",
    lastName: "Bravo",
    age: 19
  }
});

const {
  user: { name, lastName, age }
} = destructure(store, { deep: true });

name(); // => "Johnny"
```

#### Lazy vs Eager Evaluation

By default, `destructure` loops over all the available keys eagerly - on init. Lazy evaluation can be enabled via `lazy` flag.

##### Accessing keys initially missing

Lazy access allows for getting hold of accessors to keys that are not in the object yet, while still being reactive, and updating when that key will be added.

```ts
const [user, setUser] = createSignal({
  name: "John",
  lastName: "Brown"
});
const { age } = destructure(user, { lazy: true });
age(); // => undefined (not an error though)

setUser(p => ({
  ...p,
  age: 34
}));
age(); // => 34
```

##### Caching only used properties

When [caching](#caching-keys) is enabled, eager evaluation will create memos for each key, regardless of if it was accessed or not. As `lazy` waits for your read, the memos are created only for accessed keys.

```ts
const [user, setUser] = createSignal({
  name: "John",
  lastName: "Brown",
  age: 25
});
// only the `age` key will be cached
const { age } = destructure(user, { lazy: true });
```

##### Spreading limitations

No `{...obj}` or `[...list]` is possible with `lazy`, all the keys have to accessed directly.

```ts
const obj = destructure(user, { lazy: true });
// this won't work:
const newObj = { ...obj };
```

Only initially available indexes can be accessed while using this syntax: `[a, b] = list`

```ts
// DO NOT do this:
const [a, b, c] = destructure([1, 2], { lazy: true });
a(); // => 1
b(); // => 2
b(); // error (c will be undefined)

// Do this instead:
const list = destructure([1, 2], { lazy: true });
const [a, b] = list;
const c = list[2];
a(); // => 1
b(); // => 2
b(); // => undefined (no error)
```

## `wrapGetters`

Wraps object/array signal with getters for every key, making accessing properties similar to component props/store. Properties are cached with memos on access, so th primitive needs to be used in a reactive context.

#### Import

```ts
import { wrapGetters } from "@solid-primitives/destructure";
```

#### How to use it

```ts
const [getPlayer, setPlayer] = createSignal({
  name: "Raven",
  points: 350,
  weaponOfChoice: "Machete"
});
const player = wrapGetters(getPlayer);
player.points; // => 350 (reactive on updates to that property)
```

#### Wrapping nested objects

The `deep` flag enables wrapping nested objects recursively.

```ts
const [getPlayer, setPlayer] = createSignal({
  player: {
    name: "Raven",
    points: 350,
    weaponOfChoice: "Machete"
  }
});
const { player } = wrapGetters(getPlayer, { deep: true });
player.points; // => 350
```

### Acknowledgements

- This package was initially based on the implementation of `spread` and `destructure` in [solid-use](https://github.com/LXSMNSYC/solid-use).

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release of the destructure package.

</details>
