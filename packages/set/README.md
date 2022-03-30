<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Set" alt="Solid Primitives">
</p>

# @solid-primitives/set

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/set?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/set)
[![version](https://img.shields.io/npm/v/@solid-primitives/set?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/set)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

The Javascript built-in `Set` & `WeakSet` data structures as a reactive signals.

- **[`ReactiveSet`](#ReactiveSet)** - A reactive version of a Javascript built-in `Set` class.
- **[`createSet`](#createSet)** - Creates an signal instance of a `ReactiveSet`.
- **[`ReactiveWeakSet`](#ReactiveWeakSet)** - A reactive version of a Javascript built-in `WeakSet` class.
- **[`createWeakSet`](#createWeakSet)** - Creates an signal instance of a `ReactiveWeakSet`.

## Installation

```bash
npm install @solid-primitives/set
# or
yarn add @solid-primitives/set
```

## `ReactiveSet`

A reactive version of a Javascript built-in `Set` class.

### How to use it

#### Import

```ts
import { ReactiveSet } from "@solid-primitives/set";
```

#### Basic usage

```ts
const set = new ReactiveSet([1, 1, 2, 3]);

// listen for changes reactively
createEffect(() => {
  [...set]; // => [1,2,3] (reactive on any change)
  set.has(2); // => true (reactive on change to the result)
});

// apply like with normal Set
set.add(4);
set.delete(2);
set.clear();
```

#### Differences from `Set`

The interface is mostly the same, but there are some slight changes to the available mathods/returned values.

##### `.add()`

`.add()` method of `Set` returns it's instance, while in `ReactiveSet` a `boolean` is returned to indicate wheather the value was insterted to the set (was new).

```ts
const set = new ReactiveSet();
set.add(2); // => true
set.add(2); // => false
```

##### `.set()`

`.set()` is a new method added to give an availability to compleately overwrite the currect set with a new array of values.

```ts
const numbers = new ReactiveSet([1,2,3])
numbers.set([4,5,6])
[...numbers] // => [4,5,6]
```

##### `.values()`, `.entries()`, `.keys()`

In `Set` all the methods `.values()`, `.entries()`, `.keys()` do the same thing, `ReactiveSet` only has `.values()`.

## `createSet`

Creates an proxy signal instance of a [`ReactiveSet`](#reactiveset), that can be called to get the values in list form.

### How to use it

#### Import

```ts
import { createSet } from "@solid-primitives/set";
```

#### Basic usage

```ts
const set = createSet([1, 1, 2, 3]);

// listen for changes reactively
createEffect(() => {
  set(); // => [1,2,3] (reactive on any change)
  set.has(2); // => true (reactive on change to the result)
});

// apply changes like with normal Set
set.add(4);
set.delete(2);
set.clear();
```

## `ReactiveWeakSet`

A reactive version of a Javascript built-in `WeakSet` class.

### How to use it

#### Import

```ts
import { ReactiveWeakSet } from "@solid-primitives/set";
```

#### Basic usage

```ts
const set = new ReactiveWeakSet([1, 1, 2, 3]);

// listen for changes reactively
createEffect(() => {
  set.has(2); // => true (reactive on change to the result)
});

// apply changes like with normal Set
set.add(4); // (.add() returns a boolean of if the item was added to the set)
set.delete(2);
```

## `createWeakSet`

Creates an signal instance of a [`ReactiveWeakSet`](#reactiveWeakset).

### How to use it

#### Import

```ts
import { createWeakSet } from "@solid-primitives/set";
```

#### Basic usage

```ts
const set = createWeakSet([1, 1, 2, 3]);

// listen for changes reactively
createEffect(() => {
  set.has(2); // => true (reactive on change to the result)
});

// apply like with normal Set
set.add(4);
set.delete(2);
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release of the package.

</details>
