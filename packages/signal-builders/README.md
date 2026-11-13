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

#### push

Reactively appends items (signals or plain values) to an array, returning a new array.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { push } from "@solid-primitives/signal-builders";

function Demo() {
  const [fruits, setFruits] = createSignal(["apples", "bananas"]);
  const [extra, setExtra] = createSignal("kiwis");
  const list = push(fruits, extra, "avocados");
  return (
    <>
      <input value={extra()} onInput={e => setExtra(e.currentTarget.value)} />
      <button onClick={() => setFruits(f => [...f, "pears"])}>Add pears to source</button>
      <p>{list().join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### filter

Reactive `Array.prototype.filter()` — the predicate may read signals.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { filter } from "@solid-primitives/signal-builders";

function Demo() {
  const [min, setMin] = createSignal(3);
  const kept = filter([7, 3, 9, 1, 5, 8], n => n >= min());
  return (
    <>
      <button onClick={() => setMin(m => (m + 2) % 10)}>Next threshold</button>
      <p>
        ≥ {min()}: {kept().join(", ")}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### sort

Reactive `Array.prototype.sort()` returning a sorted copy; the source array is not mutated.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { sort } from "@solid-primitives/signal-builders";

function Demo() {
  const [list, setList] = createSignal([7, 3, 9, 1]);
  const [desc, setDesc] = createSignal(false);
  const sorted = sort(list, (a, b) => (desc() ? b - a : a - b));
  const addRandom = () => setList(l => [...l, Math.round(Math.random() * 20)]);
  return (
    <>
      <button onClick={() => setDesc(d => !d)}>{desc() ? "Descending" : "Ascending"}</button>
      <button onClick={addRandom}>Add random</button>
      <p>source: {list().join(", ")}</p>
      <p>sorted: {sorted().join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### map

Reactive `Array.prototype.map()` — the mapping function may read signals.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { map } from "@solid-primitives/signal-builders";

function Demo() {
  const [factor, setFactor] = createSignal(2);
  const scaled = map([1, 2, 3, 4], n => n * factor());
  return (
    <>
      <button onClick={() => setFactor(f => f + 1)}>× {factor()}</button>
      <p>{scaled().join(", ")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### Object

- **`omit`** — copy an object without the specified keys
- **`pick`** — copy an object with only the specified keys
- **`get`** — read a value at a key path (up to 6 levels deep)
- **`merge`** — shallow merge of multiple objects
- **`update`** — immutably set a value at a key path; the last argument can be a new value or a setter function `(prev) => next`

#### get

Reactively reads a value at a key path (up to 6 levels deep).

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { get } from "@solid-primitives/signal-builders";

function Demo() {
  const [user, setUser] = createSignal({ name: "Ada", address: { city: "London" } });
  const city = get(user, "address", "city");
  const move = () =>
    setUser(u => ({ ...u, address: { city: u.address.city === "London" ? "Paris" : "London" } }));
  return (
    <>
      <button onClick={move}>Move</button>
      <p>city: {city()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### merge

Reactively shallow-merges objects; later arguments override earlier ones.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { merge } from "@solid-primitives/signal-builders";

function Demo() {
  const [size, setSize] = createSignal(16);
  const options = merge({ color: "blue", size: 12 }, () => ({ size: size() }));
  return (
    <>
      <button onClick={() => setSize(s => s + 2)}>Bigger</button>
      <pre>{JSON.stringify(options())}</pre>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### update

Reactively and immutably sets a value at a key path; the last argument is a value, signal or `(prev) => next` setter.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { update } from "@solid-primitives/signal-builders";

function Demo() {
  const [last, setLast] = createSignal("Solid");
  const user = update({ name: { first: "John", last: "Doe" } }, "name", "last", last);
  return (
    <>
      <input value={last()} onInput={e => setLast(e.currentTarget.value)} />
      <pre>{JSON.stringify(user())}</pre>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

#### add

Reactive `a + b + c + ...` for numbers (or string concatenation).

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { add } from "@solid-primitives/signal-builders";

function Demo() {
  const [a, setA] = createSignal(2);
  const [b, setB] = createSignal(3);
  const sum = add(a, b, 10);
  return (
    <>
      <button onClick={() => setA(n => n + 1)}>a + 1</button>
      <button onClick={() => setB(n => n + 1)}>b + 1</button>
      <p>
        {a()} + {b()} + 10 = {sum()}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### clamp

Reactively constrains a value between `min` and `max` (inclusive).

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { clamp } from "@solid-primitives/signal-builders";

function Demo() {
  const [value, setValue] = createSignal(5);
  const [max, setMax] = createSignal(10);
  const clamped = clamp(value, 0, max);
  return (
    <>
      <button onClick={() => setValue(v => v - 4)}>-4</button>
      <button onClick={() => setValue(v => v + 4)}>+4</button>
      <button onClick={() => setMax(m => (m === 10 ? 20 : 10))}>max: {max()}</button>
      <p>
        value {value()} → clamped {clamped()}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### String

- **`lowercase`** — `String.prototype.toLowerCase()`
- **`uppercase`** — `String.prototype.toUpperCase()`
- **`capitalize`** — capitalize the first character and lowercase the rest
- **`substring`** — `String.prototype.substring()`
- **`add`** — `a + b + c + ...` (string concatenation)
- **`template`** — reactive tagged template literal

#### template

Reactive tagged template literal; interpolations can be signals or plain values.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { template } from "@solid-primitives/signal-builders";

function Demo() {
  const [greeting, setGreeting] = createSignal("Hello");
  const [target, setTarget] = createSignal("World");
  const message = template`${greeting}, ${target}!`;
  return (
    <>
      <input value={greeting()} onInput={e => setGreeting(e.currentTarget.value)} />
      <input value={target()} onInput={e => setTarget(e.currentTarget.value)} />
      <p>{message()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
