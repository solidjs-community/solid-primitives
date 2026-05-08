<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Utils" alt="Solid Primitives Utils">
</p>

# @solid-primitives/utils

Solid Primitives Utilities is a support and helper package for a number of primitives in our library. Please free to augment or centralize useful utilities and methods in this package for sharing.

## Installation

```bash
npm install @solid-primitives/utils
# or
pnpm add @solid-primitives/utils
# or
yarn add @solid-primitives/utils
```

## Immutable helpers

Functional programming helpers for making non-mutating changes to data. Keeping it immutable. Useful for updating signals.

```ts
import { pick } from "@solid-primitives/utils/immutable";

const original = { foo: 123, bar: "baz" };
const newObj = pick(original, "foo");
original; // { foo: 123, bar: "baz" }
newObj; // { foo: 123 }
```

Use it for changing signals:

```ts
import { push, update } from "@solid-primitives/utils/immutable";

const [list, setList] = createSignal([1, 2, 3]);
setList(p => push(p, 4));

const [user, setUser] = createSignal({
  name: "John",
  street: { name: "Kingston Cei", number: 24 },
});
setUser(p => update(p, "street", "number", 64));
```

## List of functions:

### Copying

- **`shallowArrayCopy`** - make shallow copy of an array
- **`shallowObjectCopy`** - make shallow copy of an object
- **`shallowCopy`** - make shallow copy of an array/object
- **`withArrayCopy`** - apply mutations to the an array without changing the original
- **`withObjectCopy`** - apply mutations to the an object without changing the original
- **`withCopy`** - apply mutations to the an object/array without changing the original

### Array

- **`push`** - non-mutating `Array.prototype.push()`
- **`drop`** - non-mutating function that drops n items from the array start
- **`dropRight`** - non-mutating function that drops n items from the array end
- **`filterOut`** - standalone `Array.prototype.filter()` that filters out passed item
- **`filter`** - standalone `Array.prototype.filter()`
- **`sort`** - non-mutating `Array.prototype.sort()` as a standalone function
- **`sortBy`** - Sort an array by object key, or multiple keys
- **`map`** - standalone `Array.prototype.map()` function
- **`slice`** - standalone `Array.prototype.slice()` function
- **`splice`** - non-mutating `Array.prototype.splice()` as a standalone function
- **`fill`** - non-mutating `Array.prototype.fill()` as a standalone function
- **`concat`** - Creates a new array concatenating array with any additional arrays and/or values.
- **`remove`** - Remove item from array
- **`removeItems`** - Remove multiple items from an array
- **`flatten`** - Flattens a nested array into a one-level array
- **`filterInstance`** - Flattens a nested array into a one-level array
- **`filterOutInstance`** - Flattens a nested array into a one-level array

### Object

- **`omit`** - Create a new subset object without the provided keys
- **`pick`** - Create a new subset object with only the provided keys
- **`split`** - Split object into multiple subset objects.
- **`merge`** - Merges multiple objects into a single one.

### Object/Array

- **`get`** - Get a single property value of an object by specifying a path to it.
- **`update`** - Change single value in an object by key, or series of recursing keys.

### Number

- **`add`** - `a + b + c + ...` _(works for numbers or strings)_
- **`substract`** - `a - b - c - ...`
- **`multiply`** - `a * b * c * ...`
- **`divide`** - `a / b / c / ...`
- **`power`** - `a ** b ** c ** ...`
- **`clamp`** - clamp a number value between two other values

## String transforms

`(string) => T` transform functions for converting raw string data into typed values. Useful as the `transform` option for SSE, WebSocket, and similar streaming primitives.

```ts
import { json, ndjson, safe } from "@solid-primitives/utils";

const { data } = createSSE<Event>(url, { transform: json });
const { data } = createSSE<Event[]>(url, { transform: ndjson });
const { data } = createSSE<Event>(url, { transform: safe(json) });
```

- **`json`** - Parse a string as a single JSON value
- **`ndjson`** - Parse newline-delimited JSON (NDJSON / JSON Lines) into an array
- **`lines`** - Split a string into a `string[]` by newline, filtering empty lines
- **`number`** - Parse a string as a number via `Number()`
- **`safe(transform, fallback?)`** - Wrap any transform in a `try/catch`; returns `fallback` instead of throwing
- **`pipe(a, b)`** - Compose two transforms into one

## wrapSetter

It is a typical use case to react on setting a new value; this is especially cumbersome for stores, where you otherwise need the `deep` package to make effects subscribe to all changes. A more performant and simple approach is to wrap the setter of your signal or store. To simplify this approach, we provide a `wrapSetter` function:

```ts
import { createStore } from "solid-js";
import { wrapSetter } from "@solid-primitives/utils";

const [state, setState] = wrapSetter(
  createStore(
    localStorage.getItem('persistedState')
    ? JSON.parse(localStorage.getItem('persistedState')) 
    : initialState
  ),
  (setter) => { 
    const output = setState();
    localStorage.setItem('persistedState', latest(() => JSON.stringify(state)));
    return output;
  }
);
```

If the signal or store is destructured into a tuple and augmented with additional values, those are left intact in the output. For the TS types to work, you need to `as const` the new tuple:

```ts
import { createSignal } from "solid-js";
import { wrapSetter } from "@solid-primitives/utils";

const augmentedSignal = [...createSignal(0), { extra: "data" }] as const;
const [count, setCount, data] = wrapSetter(
  augmented,
  (setter) => (next) => (console.log(next), setter(next))
);
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
