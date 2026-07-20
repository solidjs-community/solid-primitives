<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Signal%20Builders" alt="Solid Primitives Signal Builders">
</p>

# @solid-primitives/signal-builders

[![size](https://img.shields.io/badge/size-1.53_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/signal-builders)
[![version](https://img.shields.io/npm/v/@solid-primitives/signal-builders?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/signal-builders)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A collection of chainable, composable reactive computations — **Signal Builders** — for common array, object, number, string, and type-conversion operations.

## Installation

```bash
npm install @solid-primitives/signal-builders
# or
yarn add @solid-primitives/signal-builders
# or
pnpm add @solid-primitives/signal-builders
```

Requires `solid-js@^2.0.0-beta.13` as a peer dependency.

## Usage

Each builder wraps its computation in `createMemo`, so results only update when the computed value actually changes. Builders must be called inside a reactive owner (a component body or `createRoot`), and computations should be kept pure — avoid side effects inside them.

Because each builder returns an `Accessor<T>`, the output of one can be passed directly as input to another:

### Boolean

```ts
import { toggle } from "@solid-primitives/signal-builders";

const [isOpen, setIsOpen] = createSignal(false);
const toggleOpen = toggle(setIsOpen);

toggleOpen(); // isOpen() === true
```

### Array

```ts
import { push, flatten, remove } from "@solid-primitives/signal-builders";

const [fruits, setFruits] = createSignal(["apples", "bananas", "oranges", "tomatoes"]);
const [toRemove, setToRemove] = createSignal("tomatoes");

const list = flatten(remove(push(fruits, ["kiwis", "avocados"]), toRemove));

list(); // ["apples", "bananas", "oranges", "kiwis", "avocados"]
```

### Object

```ts
import { update, merge } from "@solid-primitives/signal-builders";

const [user, setUser] = createSignal({ name: { first: "John", last: "Doe" } });
const [last, setLast] = createSignal("Solid");

const modifiedUser = merge(update(user, "name", "last", last), { age: 21 });

modifiedUser(); // { name: { first: "John", last: "Solid" }, age: 21 }
```

### Number

```ts
import { add, multiply, clamp, int } from "@solid-primitives/signal-builders";

const [input, setInput] = createSignal("123");
const [offset, setOffset] = createSignal(-45);
const [max, setMax] = createSignal(1000);

const value = clamp(multiply(int(input), add(offset, 54, 9)), 0, max);
```

### String

```ts
import { lowercase, substring, template, add } from "@solid-primitives/signal-builders";

const [greeting, setGreeting] = createSignal("Hello");
const [target, setTarget] = createSignal("World");

const message = template`${greeting}, ${target}!`;
message(); // => "Hello, World!"

const solidMessage = lowercase(add(substring(message, 0, 7), "Solid"));
solidMessage(); // => "hello, solid"
```

## Builder Reference

### Boolean

- **`toggle`** — wraps a boolean setter with a function that flips the current value

### Array

- **`push`** — append items to an array
- **`drop`** — remove n items from the start
- **`dropRight`** — remove n items from the end
- **`filter`** — `Array.prototype.filter()`
- **`filterOut`** — remove all occurrences of a specific item
- **`remove`** — remove the first occurrence of a specific item
- **`removeItems`** — remove multiple specific items
- **`splice`** — `Array.prototype.splice()`
- **`slice`** — `Array.prototype.slice()`
- **`map`** — `Array.prototype.map()`
- **`sort`** — `Array.prototype.sort()`
- **`concat`** — concatenate multiple arrays
- **`flatten`** — flatten one level of nesting
- **`filterInstance`** — keep only items that are instances of the specified classes
- **`filterOutInstance`** — remove items that are instances of the specified classes

### Object

- **`omit`** — copy an object without the specified keys
- **`pick`** — copy an object with only the specified keys
- **`get`** — read a value at a key path (up to 6 levels deep)
- **`merge`** — shallow merge of multiple objects
- **`update`** — immutably set a value at a key path; the last argument can be a new value or a setter function `(prev) => next`

### Convert

- **`string`** — convert a value to a string
- **`float`** — parse a string as a float (`Number.parseFloat`)
- **`int`** — parse a string as an integer (`Number.parseInt`)
- **`join`** — join an array into a string with a separator

### Number

- **`add`** — `a + b + c + ...`
- **`substract`** — `a - b - c - ...`
- **`multiply`** — `a * b * c * ...`
- **`divide`** — `a / b / c / ...`
- **`power`** — `a ** b ** c ** ...`
- **`clamp`** — constrain a value between min and max
- **`round`** — `Math.round()`
- **`ceil`** — `Math.ceil()`
- **`floor`** — `Math.floor()`

### String

- **`lowercase`** — `String.prototype.toLowerCase()`
- **`uppercase`** — `String.prototype.toUpperCase()`
- **`capitalize`** — capitalize the first character and lowercase the rest
- **`substring`** — `String.prototype.substring()`
- **`add`** — `a + b + c + ...` (string concatenation)
- **`template`** — reactive tagged template literal

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
