<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=scheduled" alt="Solid Primitives Scheduled">
</p>

# @solid-primitives/scheduled

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/scheduled?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/scheduled)
[![version](https://img.shields.io/npm/v/@solid-primitives/scheduled?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/scheduled)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for creating scheduled — throttled or debounced — callbacks.

- [`debounce`](#debounce) - Creates a callback that is **debounced** and cancellable.
- [`throttle`](#throttle) - Creates a callback that is **throttled** and cancellable.
- [`scheduleIdle`](#scheduleIdle) - Creates a callback throttled using `window.requestIdleCallback()`.
- [`leading`](#leading) - Creates a scheduled and cancellable callback that will be called on **leading** edge.

## Installation

```bash
npm install @solid-primitives/scheduled
# or
yarn add @solid-primitives/scheduled
```

## `debounce`

Creates a callback that is debounced and cancellable. The debounced callback is called on **trailing** edge.

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

The throttled callback is called on **trailing** edge.

The timeout will be automatically cleared on root dispose.

> **Note:** `requestIdleCallback` is not available in all browsers. If it's not available, `scheduleIdle` will fallback to `throttle` with default timeout.

### How to use it

```ts
import { scheduleIdle } from "@solid-primitives/scheduled";

const trigger = scheduleIdle(
  (message: string) => console.log(message),
  // timeout passed to requestIdleCallback is a maximum timeout before the callback is called
  250
);
trigger("Hello!");
trigger.clear(); // clears a timeout in progress
```

## `leading`

Creates a scheduled and cancellable callback that will be called on **leading** edge.

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

## Scheduling explanation

This package provides 4 different methods for scheduling a callback. Pick one that suits your application.

```
TOP: scheduled function triggered
BOTTOM: called user callback

1. debounce
2. throttle
3. leading debounce
4. leading throttle

   █   █     █
------------------------>
1.                  █
2.        █         █
3. █
4. █         █
```

[**Interactive DEMO of the schematic above**](https://codesandbox.io/s/solid-primitives-scheduled-demo-0uk8xc?file=/index.tsx)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
