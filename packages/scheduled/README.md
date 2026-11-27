<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=scheduled&version=2.0" alt="Solid Primitives Scheduled">
</p>

# @solid-primitives/scheduled

[![size](https://img.shields.io/badge/size-1.01_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/scheduled)
[![version](https://img.shields.io/npm/v/@solid-primitives/scheduled?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/scheduled)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Primitives for creating scheduled — throttled or debounced — callbacks and derived values.

- [`debounce`](#debounce) - Creates a callback that is **debounced** and cancellable.
- [`throttle`](#throttle) - Creates a callback that is **throttled** and cancellable.
- [`scheduleIdle`](#scheduleidle) - Creates a callback throttled using `window.requestIdleCallback()`.
- [`leading`](#leading) - Creates a scheduled and cancellable callback that will be called on **leading** edge.
- [`leadingAndTrailing`](#leadingandtrailing) - Calls on the leading edge once, then on the trailing edge.
- [`createDebounced`](#createdebounced) - Creates a derived accessor with a **debounced** value.
- [`createThrottled`](#createthrottled) - Creates a derived accessor with a **throttled** value.
- [`createScheduled`](#createscheduled) - Creates a signal used for scheduling execution of solid computations by tracking.
- [Scheduling explanation](#scheduling-explanation)

## Installation

```bash
npm install @solid-primitives/scheduled
# or
yarn add @solid-primitives/scheduled
# or
pnpm add @solid-primitives/scheduled
```

## `debounce`

Creates a callback that is debounced and cancellable. The debounced callback is called on **trailing** edge.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";

function Demo() {
  const [value, setValue] = createSignal("");
  const update = debounce((text: string) => setValue(text), 500);
  return (
    <>
      <input placeholder="Type something…" onInput={e => update(e.currentTarget.value)} />
      <button onClick={() => update.clear()}>Cancel</button>
      <p>debounced: {value()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The timeout will be automatically cleared on root dispose.

### How to use it

```ts
import { debounce } from "@solid-primitives/scheduled";

const trigger = debounce((message: string) => console.log(message), 250);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress
```

## `throttle`

Creates a callback that is throttled and cancellable. The throttled callback is called on **trailing** edge.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { throttle } from "@solid-primitives/scheduled";

function Demo() {
  const [clicks, setClicks] = createSignal(0);
  const [fires, setFires] = createSignal(0);
  const trigger = throttle(() => setFires(n => n + 1), 1000);
  return (
    <>
      <button
        onClick={() => {
          setClicks(n => n + 1);
          trigger();
        }}
      >
        Click rapidly
      </button>
      <p>
        clicks: {clicks()} / callback fires: {fires()}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The timeout will be automatically cleared on root dispose.

### How to use it

```ts
import { throttle } from "@solid-primitives/scheduled";

const trigger = throttle((message: string) => console.log(message), 250);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress
```

## `scheduleIdle`

Creates a callback throttled using `window.requestIdleCallback()`. ([MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback))

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { scheduleIdle } from "@solid-primitives/scheduled";

function Demo() {
  const [moves, setMoves] = createSignal(0);
  const [idleRuns, setIdleRuns] = createSignal(0);
  const [pos, setPos] = createSignal("");
  const update = scheduleIdle((x: number, y: number) => {
    setIdleRuns(n => n + 1);
    setPos(`${x}, ${y}`);
  }, 250);
  return (
    <div
      style={{ height: "150px", border: "1px solid gray" }}
      onPointerMove={e => {
        setMoves(n => n + 1);
        update(e.clientX, e.clientY);
      }}
    >
      <p>pointer moves: {moves()}</p>
      <p>idle updates: {idleRuns()}</p>
      <p>last idle position: {pos()}</p>
    </div>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The throttled callback is called on **trailing** edge.

The timeout will be automatically cleared on root dispose.

> **Note:** `requestIdleCallback` is not available in Safari. If it's not available, `scheduleIdle` will fallback to `throttle` with default timeout. (callbacks will be batched using setTimeout instead)

### How to use it

```ts
import { scheduleIdle } from "@solid-primitives/scheduled";

const trigger = scheduleIdle(
  (message: string) => console.log(message),
  // timeout passed to requestIdleCallback is a maximum timeout before the callback is called
  250,
);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress
```

## `leading`

Creates a scheduled and cancellable callback that will be called on **leading** edge.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { leading, debounce } from "@solid-primitives/scheduled";

function Demo() {
  const [log, setLog] = createSignal<string[]>([]);
  const trigger = leading(
    debounce,
    () => setLog(l => [new Date().toLocaleTimeString(), ...l].slice(0, 5)),
    1000,
  );
  return (
    <>
      <button onClick={() => trigger()}>Click rapidly</button>
      <p>Fires on the first click, then again only after 1s of no clicks.</p>
      <ul>
        <For each={log()}>{t => <li>{t}</li>}</For>
      </ul>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The timeout will be automatically cleared on root dispose.

### How to use it

```ts
// with debounce
import { leading, debounce } from "@solid-primitives/scheduled";

const trigger = leading(debounce, (message: string) => console.log(message), 250);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress

// with throttle
import { leading, throttle } from "@solid-primitives/scheduled";

const trigger = leading(throttle, (message: string) => console.log(message), 250);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress
```

## `leadingAndTrailing`

Creates a scheduled and cancellable callback that will be called on **leading** edge for the first call, and **trailing** edge thereafter.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { leadingAndTrailing, throttle } from "@solid-primitives/scheduled";

function Demo() {
  const [log, setLog] = createSignal<string[]>([]);
  const trigger = leadingAndTrailing(
    throttle,
    (n: number) => setLog(l => [`click #${n}`, ...l].slice(0, 5)),
    1000,
  );
  let clicks = 0;
  return (
    <>
      <button onClick={() => trigger(++clicks)}>Click rapidly</button>
      <ul>
        <For each={log()}>{t => <li>{t}</li>}</For>
      </ul>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The timeout will be automatically cleared on root dispose.

### How to use it

```ts
// with debounce
import { leadingAndTrailing, debounce } from "@solid-primitives/scheduled";

const trigger = leadingAndTrailing(debounce, (message: string) => console.log(message), 250);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress

// with throttle
import { leadingAndTrailing, throttle } from "@solid-primitives/scheduled";

const trigger = leadingAndTrailing(throttle, (message: string) => console.log(message), 250);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress
```

## `createDebounced`

Creates a derived accessor whose value is **debounced** on the trailing edge.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, isPending } from "solid-js";
import { createDebounced } from "@solid-primitives/scheduled";

function Demo() {
  const [query, setQuery] = createSignal("");
  const debouncedQuery = createDebounced(query, 500);
  return (
    <>
      <input placeholder="Type something…" onInput={e => setQuery(e.currentTarget.value)} />
      <p>query: {query()}</p>
      <p>debounced: {debouncedQuery()}</p>
      <p>pending: {String(isPending(debouncedQuery))}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The initial value is available synchronously. While a change is held back, the accessor keeps returning the previous value and `isPending(debouncedQuery)` is `true`. When the source has been quiet for `wait` milliseconds, the latest value lands through the reactive graph. If the source is itself async, its first answer follows Solid's normal `Loading` path; subsequent changes use the normal pending machinery.

### Definition

```ts
type ScheduleEdgeOptions =
  { leading?: false; trailing?: true } | { leading: true; trailing?: boolean };

type MaxWaitOptions = {
  maxWait?: number;
};

function createDebounced<T>(
  source: Accessor<T>,
  wait: number,
  options?: ScheduleEdgeOptions & MaxWaitOptions,
): Accessor<T>;
```

### Options

The default is trailing-only (`leading: false`, `trailing: true`).

| Option     | Type      | Default | Description                                                                                                             |
| ---------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `wait`     | `number`  | —       | Debounce duration in milliseconds.                                                                                      |
| `leading`  | `boolean` | `false` | Emit the first change immediately.                                                                                      |
| `trailing` | `boolean` | `true`  | Emit the latest value at the end of the window.                                                                         |
| `maxWait`  | `number`  | —       | Maximum time to hold a value back while changes continue. Without it, continuous changes can defer the landing forever. |

`leading: false, trailing: false` is a type error.

## `createThrottled`

Creates a derived accessor whose value is **throttled** on the trailing edge.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, isPending } from "solid-js";
import { createThrottled } from "@solid-primitives/scheduled";

function Demo() {
  const [clicks, setClicks] = createSignal(0);
  const throttledClicks = createThrottled(clicks, 1_000);
  return (
    <>
      <button onClick={() => setClicks(n => n + 1)}>Click rapidly</button>
      <p>
        clicks: {clicks()} / throttled: {throttledClicks()} / pending:{" "}
        {String(isPending(throttledClicks))}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

The first change opens a fixed window of `wait` milliseconds. Changes made during that window are coalesced into its trailing value and do not reset the timer. While the value is held back, the accessor keeps returning the previous value and `isPending(throttledClicks)` is `true`.

### Definition

```ts
type ScheduleEdgeOptions =
  { leading?: false; trailing?: true } | { leading: true; trailing?: boolean };

function createThrottled<T>(
  source: Accessor<T>,
  wait: number,
  options?: ScheduleEdgeOptions,
): Accessor<T>;
```

### Options

The default is trailing-only (`leading: false`, `trailing: true`).

| Option     | Type      | Default | Description                                     |
| ---------- | --------- | ------- | ----------------------------------------------- |
| `wait`     | `number`  | —       | Throttle window in milliseconds.                |
| `leading`  | `boolean` | `false` | Emit the first change immediately.              |
| `trailing` | `boolean` | `true`  | Emit the latest value at the end of the window. |

`leading: false, trailing: false` is a type error.

## `createScheduled`

Creates a signal used for scheduling execution of solid computations by tracking.

```tsx repl
import { render } from "@solidjs/web";
import { createMemo, createSignal } from "solid-js";
import { createScheduled, debounce } from "@solid-primitives/scheduled";

function Demo() {
  const [count, setCount] = createSignal(0);
  const scheduled = createScheduled(fn => debounce(fn, 800));
  const debouncedCount = createMemo((prev?: number) => {
    const value = count();
    return scheduled() ? value : (prev ?? 0);
  });
  return (
    <>
      <button onClick={() => setCount(n => n + 1)}>Increment</button>
      <p>count: {count()}</p>
      <p>debounced count: {debouncedCount()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`createScheduled` takes only one parameter - a `schedule` function. This function is called with a callback that should be scheduled. It should return a function for triggering the timeout.

```ts
// e.g. with debounce
createScheduled(fn => debounce(fn, 1000));
// e.g. with throttle
createScheduled(fn => throttle(fn, 1000));
// e.g. with leading debounce
createScheduled(fn => leading(debounce, fn, 1000));
// e.g. with leading throttle
createScheduled(fn => leading(throttle, fn, 1000));
```

It returns a signal that can be used to schedule execution of a solid computation. The signal returns `true` if it's dirty _(callback should be called)_ and `false` otherwise.

```ts
import { createScheduled, debounce } from "@solid-primitives/scheduled";

const scheduled = createScheduled(fn => debounce(fn, 1000));

const [count, setCount] = createSignal(0);

// In Solid 2.0, use the two-arg createEffect: compute (tracked) + apply (side effects)
createEffect(
  () => {
    // compute: track both source signal and the scheduled signal
    const value = count();
    const dirty = scheduled();
    return { value, dirty };
  },
  ({ value, dirty }) => {
    if (dirty) {
      console.log("count", value);
    }
  },
);

// or with createMemo
const debouncedCount = createMemo((p: number = 0) => {
  // track source signal
  const value = count();
  // track the debounced signal and check if it's dirty
  return scheduled() ? value : p;
});
```

## Scheduling explanation

This package provides 4 different methods for scheduling a callback. Pick one that suits your application.

```
TOP: scheduled function triggered
BOTTOM: called user callback

1. debounce
2. throttle
3. leading debounce
4. leading throttle
5. leadingAndTrailing debounce
6. leadingAndTrailing throttle

   █   █     █
------------------------>
1.                  █
2.        █         █
3. █
4. █         █
5. █                █
6. █      █         █
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
