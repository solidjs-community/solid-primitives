<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=mutable" alt="Solid Primitives mutable">
</p>

# @solid-primitives/mutable

[![size](https://img.shields.io/badge/size-1.17_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/mutable)
[![version](https://img.shields.io/npm/v/@solid-primitives/mutable?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/mutable)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A primitive for creating a mutable store proxy object. A compatibility layer for code that relies on direct mutation semantics (similar to MobX/Vue reactivity).

- [`createMutable`](#createmutable) - Creates a mutable store proxy object.
- [`modifyMutable`](#modifymutable) - Helper for applying multiple mutations to a mutable store in one call.

## Installation

```bash
npm install @solid-primitives/mutable
# or
pnpm add @solid-primitives/mutable
# or
yarn add @solid-primitives/mutable
```

## `createMutable`

```ts
import { createMutable } from "@solid-primitives/mutable";

declare function createMutable<T extends object>(state: T): T;
```

Creates a new mutable Store proxy object. Stores only trigger updates on values changing. Tracking is done by intercepting property access and automatically tracks deep nesting via proxy.

Useful for integrating external systems or as a compatibility layer with MobX/Vue.

> **Note:** A mutable state can be passed around and mutated anywhere, which can make it harder to follow and easier to break unidirectional flow. It is generally recommended to use `createStore` instead.

```js
const state = createMutable(initialValue);

// read value
state.someValue;

// set value
state.someValue = 5;

state.list.push(anotherValue);
```

Mutables support setters along with getters.

```js
const user = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
});
```

Only plain objects and arrays are deep-proxied. Class instances (e.g. `Date`, `Map`, `Set`) are stored and returned as-is.

## `modifyMutable`

```ts
import { modifyMutable } from "@solid-primitives/mutable";

declare function modifyMutable<T>(mutable: T, modifier: (state: T) => void): void;
```

Applies multiple mutations to a mutable Store via a single modifier function. Since all writes in Solid are automatically batched, dependent computations update once after all changes are applied.

The modifier receives the mutable proxy directly and should mutate it in place:

```ts
const state = createMutable({
  user: {
    firstName: "John",
    lastName: "Smith",
  },
});

// Modify two fields — single reactive update
modifyMutable(state.user, u => {
  u.firstName = "Jake";
  u.lastName = "Johnson";
});
```

## Demo

[Deployed example](https://primitives.solidjs.community/playground/mutable) | [Source code](https://github.com/solidjs-community/solid-primitives/tree/main/packages/mutable/dev/index.tsx)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
