<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Timer" alt="Solid Primitives Timer">
</p>

# @solid-primitives/timer

[![size](https://img.shields.io/badge/size-577_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/timer)
[![version](https://img.shields.io/npm/v/@solid-primitives/timer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/timer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Timer primitives related to [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/setInterval) and [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout):

- [`makeTimer`](#maketimer) - Creates a timer and returns a function to clear it. No reactive lifecycle — the caller decides cleanup.
- [`createTimer`](#createtimer) - Reactive timer with an optionally reactive delay and automatic cleanup.
- [`createTimeoutLoop`](#createtimeoutloop) - Like `createTimer` with `setInterval`, but the delay only updates between executions.
- [`createPolled`](#createpolled) - Polls a function periodically and returns an accessor to its latest value.
- [`createIntervalCounter`](#createintervalcounter) - A counter that increments periodically.

## Installation

```bash
npm install @solid-primitives/timer
# or
yarn add @solid-primitives/timer
# or
pnpm add @solid-primitives/timer
```

## How to use it

### makeTimer

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import { makeTimer } from "@solid-primitives/timer";

function Demo() {
  const [count, setCount] = createSignal(0);
  const [running, setRunning] = createSignal(false);
  let clear: VoidFunction | undefined;
  const toggle = () => {
    if (running()) {
      clear?.();
      setRunning(false);
    } else {
      clear = makeTimer(() => setCount(c => c + 1), 500, setInterval);
      setRunning(true);
    }
  };
  onCleanup(() => clear?.());
  return (
    <>
      <button onClick={toggle}>{running() ? "Stop" : "Start"}</button>
      <p>ticks: {count()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

Creates a timer ([setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) or [setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)) and returns a function to clear it. This is a base primitive with no reactive lifecycle integration — the caller is responsible for cleanup.

To tie cleanup to a reactive scope, pass the returned function to `onCleanup`:

```ts
import { onCleanup } from "solid-js";
import { makeTimer } from "@solid-primitives/timer";

// Manual cleanup
const clear = makeTimer(() => console.log("tick"), 1000, setInterval);
// ...
clear();

// Tied to a reactive scope
onCleanup(makeTimer(() => console.log("tick"), 1000, setInterval));
```

### createTimer

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createTimer } from "@solid-primitives/timer";

function Demo() {
  const [delay, setDelay] = createSignal<number | false>(1000);
  const [count, setCount] = createSignal(0);
  createTimer(() => setCount(c => c + 1), delay, setInterval);
  return (
    <>
      <button onClick={() => setDelay(250)}>250ms</button>
      <button onClick={() => setDelay(1000)}>1000ms</button>
      <button onClick={() => setDelay(false)}>Pause</button>
      <p>
        ticks: {count()} (delay: {delay() === false ? "paused" : `${delay()}ms`})
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

A reactive timer whose delay can be a static number or a reactive accessor. When the delay accessor returns `false`, the timer is disabled. Automatically cleans up when the reactive scope is disposed.

When the delay changes, the elapsed fraction of the previous delay carries forward — so changing from 1000ms to 2000ms after 250ms elapsed will fire the next callback after 1500ms, not 2000ms.

```ts
import { createSignal } from "solid-js";
import { createTimer } from "@solid-primitives/timer";

// Static delay
createTimer(() => console.log("timeout"), 1000, setTimeout);
createTimer(() => console.log("interval"), 1000, setInterval);

// Reactive delay with pause support
const [paused, setPaused] = createSignal(false);
const [delay, setDelay] = createSignal(1000);

createTimer(
  () => console.log("tick"),
  () => !paused() && delay(),
  setInterval,
);

setDelay(500); // change interval
setPaused(true); // pause
setPaused(false); // resume
```

### createTimeoutLoop

Similar to `createTimer` with `setInterval`, but the delay is only read between executions rather than reactively. This means a delay change takes effect after the current interval completes.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createTimeoutLoop } from "@solid-primitives/timer";

function Demo() {
  const [delay, setDelay] = createSignal(2000);
  const [count, setCount] = createSignal(0);
  createTimeoutLoop(() => setCount(c => c + 1), delay);
  return (
    <>
      <button onClick={() => setDelay(250)}>250ms</button>
      <button onClick={() => setDelay(2000)}>2000ms</button>
      <p>
        ticks: {count()} (next delay: {delay()}ms, applied after the current tick)
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createSignal } from "solid-js";
import { createTimeoutLoop } from "@solid-primitives/timer";

// Static delay
createTimeoutLoop(() => console.log("loop"), 1000);

// Reactive delay — updates between executions
const [delay, setDelay] = createSignal(1000);
createTimeoutLoop(() => console.log("loop"), delay);
// ...
setDelay(500); // takes effect after the current interval fires
```

### createPolled

Polls a function periodically and returns an accessor to its latest return value. The function is called immediately on creation, then after each interval. If the polling function reads reactive signals, the accessor also updates when those signals change.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createPolled } from "@solid-primitives/timer";

function Demo() {
  const [delay, setDelay] = createSignal<number | false>(1000);
  const time = createPolled(() => new Date().toLocaleTimeString(), delay);
  return (
    <>
      <button onClick={() => setDelay(d => (d === false ? 1000 : false))}>
        {delay() === false ? "Resume" : "Pause"}
      </button>
      <p>The time is: {time()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```tsx
import { createSignal } from "solid-js";
import { createPolled } from "@solid-primitives/timer";

// Poll current time every second
const date = createPolled(() => new Date(), 1000);
<span>The time is: {date()}</span>;

// Reactive source — updates on interval AND when source changes
const [id, setId] = createSignal(1);
const user = createPolled(() => cache.get(id()), 5000);

// Reactive delay
const [delay, setDelay] = createSignal(1000);
const polled = createPolled(() => new Date(), delay);
setDelay(500);
```

### createIntervalCounter

A counter that starts at `0` and increments by one each interval. Accepts a static or reactive delay.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createIntervalCounter } from "@solid-primitives/timer";

function Demo() {
  const [delay, setDelay] = createSignal<number | false>(1000);
  const count = createIntervalCounter(delay);
  return (
    <>
      <button onClick={() => setDelay(100)}>100ms</button>
      <button onClick={() => setDelay(1000)}>1000ms</button>
      <button onClick={() => setDelay(false)}>Pause</button>
      <p>count: {count()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```tsx
import { createSignal } from "solid-js";
import { createIntervalCounter } from "@solid-primitives/timer";

const count = createIntervalCounter(1000);
<span>Count: {count()}</span>;

// Reactive delay
const [delay, setDelay] = createSignal(1000);
const count = createIntervalCounter(delay);
setDelay(500);
```

## Note on Reactive Delays

When a delay changes, the fraction of the current interval already elapsed carries over to the new delay. For example, if a 1000ms delay is changed to 2000ms after 250ms (25% done), the first callback with the new delay fires after 1500ms (75% of 2000ms), and subsequent callbacks fire every 2000ms.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
