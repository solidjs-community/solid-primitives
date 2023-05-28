<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=lenses" alt="Solid Primitives lenses">
</p>

# @solid-primitives/lenses

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/lenses?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/lenses)
[![version](https://img.shields.io/npm/v/@solid-primitives/lenses?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/lenses)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Utilities for working with nested reactivity in a modular way.

- `createLens` - Given a path within a Store object, return a derived or "focused"
getter and setter pair.

- `createFocusedGetter` - The first half of the lens tuple; a derived signal
using path syntax on an object.

- `createFocusedSetter` - The second half of the lens tuple; a Setter
for a specific path within a Store.

## Installation

```bash
npm install @solid-primitives/lenses
# or
yarn add @solid-primitives/lenses
# or
pnpm add @solid-primitives/lenses
```

## How to use it

```ts
// Start with an ordinary SolidJS Store
const storeTuple = createStore([
  { myString: 'first' }
])

// Create a lens to focus on one particular item in the Store.
// Any valid path accepted by `setStore` works here!
const [firstString, setFirstString] = createLens(storeTuple, 0, myString)

// Setters and Getters work just like ordinary Signals
setFirstString("woohoo") // equivalent to `setStore(0, "myString", "woohoo")
console.log(firstString()) // "woohoo"

```

## Motivation

### 1. Separation of Concerns

Components can receive scoped Setters for only the parts of state they need
access to, rather than needing a top-level `setStore` function.

### 2. Type-safety

Essentially, we are just [partially
applying](https://en.wikipedia.org/wiki/Partial_application) a `setStore`
function with an initial path, and returning a function that will apply the
remainder of the path. It is just syntactic sugar, and under the hood
everything is using calls to native Store functionality.

The same approach can already be used by the Setter returned by `createStore`. However,
Typescript users will find it hard to maintain type-safety for the arguments
passed to a "derived"/partially-applied Setter. The type definitions for `SetStoreFunction` are...
[daunting](https://github.com/solidjs/solid/blob/44a0fdeb585c4f5a3b9bccbf4b7d6c60c7db3ecd/packages/solid/store/src/store.ts#L389).

The `lenses` package alleviates this friction by providing both `StorePath<T>`
and `EvaluatePath<T, P>` generic type helpers.

### 3. Shared path syntax between Getters and Setters

The path syntax defined in Solid Stores is incredibly expressive and powerful.
By introducing `createScopedGetter`, the same syntax can be also be used to
access Store values as derived Signals. This is particularly relevant to
child components which may both display and modify items from a Store
collection.

## TODO

- [X] Type-safe path syntax
- [X] Handle arrays
- [X] Export separate primitives for Getter and Setter
  - [X] `createFocusedGetter`
  - [X] `createFocusedSetter`
- [X] Handle accessors in `createFocusedGetter`
- [ ] Handle multiple array index syntax (`setStore([1, 2], old => old + 1)`)
- [ ] Test and/or implement mutation syntax setter (`prev => next`)
- [ ] Test all variations of path syntax (for both setter and getter)
- [ ] Test edge case: repeated filter functions in array path
  - This may differ from `SetStoreFunction`
- [ ] Check and/or replicate official SolidJS Store unit tests for parity

## Demo

You can use this template for publishing your demo on CodeSandbox: <https://codesandbox.io/s/solid-primitives-demo-template-sz95h>

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
