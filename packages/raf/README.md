<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=RAF" alt="Solid Primitives RAF">
</p>

# @solid-primitives/raf

[![size](https://img.shields.io/badge/size-546_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/raf)
[![size](https://img.shields.io/npm/v/@solid-primitives/raf?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/raf)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive primitives providing support to `window.requestAnimationFrame`.

- [`createRAF`](#createraf) - Creates an auto-disposing requestAnimationFrame loop.
- [`targetFPS`](#targetfps) - Used to limit the FPS of [`createRAF`](#createraf)

## Installation

```
npm install @solid-primitives/raf
# or
yarn add @solid-primitives/raf
# or
pnpm add @solid-primitives/raf
```

## `createRAF`

A primitive creating reactive `window.requestAnimationFrame`, that is automatically disposed onCleanup.

It takes a `callback` argument that will run on every frame.

Returns a signal if currently running as well as start and stop methods

```ts
import createRAF from "@solid-primitives/raf";

const [running, start, stop] = createRAF(timeStamp => console.log("Time stamp is", timeStamp));

running(); // => false
start();
running(); // => true
```

#### Definition

```ts
function createRAF(
  callback: FrameRequestCallback,
): [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction];
```

#### Warning

To respect clients refresh rate, timeStamp should be used to calculate how much the animation should progress in a given frame, otherwise the animation will run faster on high refresh rate screens. As an example: A screen refreshing at 300fps will run the animations 5x faster than a screen with 60fps if you use other forms of time keeping that don't consider this. Please see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

## `targetFPS`

A primitive for wrapping `window.requestAnimationFrame` callback function to limit the execution of the callback to specified number of FPS.

Keep in mind that limiting FPS is achieved by not executing a callback if the frames are above defined limit. This can lead to not consistant frame duration.

The `targetFPS` primitive takes two arguments:

- `callback` - The callback to run each _allowed_ frame
- `fps` - The target FPS limit

```ts
import createRAF, { targetFPS } from "@solid-primitives/raf";

const [running, start, stop] = createRAF(
  targetFPS(timeStamp => console.log("Time stamp is", timeStamp), 60)
);

// the target fps value can be a reactive signal
const [fps, setFps] = createSignal(60);
createRAF(targetFPS((timestamp) => {...}, fps));
```

#### Definition

```ts
function targetFPS(
  callback: FrameRequestCallback,
  fps: MaybeAccessor<number>,
): FrameRequestCallback;
```

## createMs

Using createRAF and targetFPS to create a signal giving the passed milliseconds since it was called with a configurable frame rate, with some added methods for more control:

- `reset()`: manually resetting the counter
- `running()`: returns if the counter is currently setRunning
- `start()`: restarts the counter if stopped
- `stop()`: stops the counter if running

It takes the framerate as single argument, either as `number` or `Accessor<number>`. It also accepts the limit as an optional second argument, either as `number` or `Accessor<number>`; the counter is reset if the limit is passed.

```tsx
import { createMs } from "@solid-primitives/raf";

const MovingRect() {
  const ms = createMs(60);
  return <rect x="0" y="0" width={1000 / 3000 * Math.min(ms(), 3000)} height="10" />;
}
```

#### Definition

```ts
function createMs(
  fps: MaybeAccessor<number>,
  limit?: MaybeAccessor<number>,
): Accessor<number> & {
  reset: () => void;
  running: () => boolean;
  start: () => void;
  stop: () => void;
};
```

## createCallbacksSet

Combines several callbacks into one. Use it with `createRAF` when several callbacks should run in the same `requestAnimationFrame` and share its timestamp. Callbacks live in a [`ReactiveSet`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/set#ReactiveSet), so you can add and remove them at any time.

```ts
// Type
function createCallbacksSet<T extends (...args: any) => void>(
  ...initialCallbacks: Array<T>
): [callback: (...args: Parameters<T>) => void, callbacksSet: ReactiveSet<T>];

// Example
import { createCallbacksSet, createRAF } from "@solid-primitives/raf";

const [callback, callbacks] = createCallbacksSet<FrameRequestCallback>();
const [running, start, stop] = createRAF(callback);

const move: FrameRequestCallback = ts => (el.style.transform = `translateX(${ts / 10}px)`);
callbacks.add(move);
start();
// later
callbacks.delete(move);
```

## useGlobalRAF

Returns a factory for callbacks that share one global `requestAnimationFrame` loop, so they all run in the same frame with the same timestamp. The loop is a single `createRAF` in a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot), combined with [`createCallbacksSet`](#createcallbacksset).

Each call returns `[added, add, remove, running, start, stop]`:

- `added`, `add`, `remove` control whether this callback is in the shared loop. It is removed on cleanup.
- `running`, `start`, `stop` control the shared loop itself, like `createRAF`.

Pass `startWhenAdded` (a boolean or accessor) to start the loop when the callback is added. The loop stops when the last callback is removed.

```ts
// Type
function useGlobalRAF(): (
  callback: FrameRequestCallback,
  startWhenAdded?: MaybeAccessor<boolean>,
) => [
  added: Accessor<boolean>,
  add: VoidFunction,
  remove: VoidFunction,
  running: Accessor<boolean>,
  start: VoidFunction,
  stop: VoidFunction,
];

// Example
import { flush } from "solid-js";
import { targetFPS, useGlobalRAF } from "@solid-primitives/raf";

const createGlobalRAFCallback = useGlobalRAF();

// Low frame rate, e.g. sampling a webcam
const [hasSampler, addSampler, removeSampler] = createGlobalRAFCallback(
  targetFPS(() => {
    /* ... */
  }, 30),
  true,
);
// High frame rate, e.g. drawing to a canvas
const [hasDraw, addDraw, removeDraw, running] = createGlobalRAFCallback(
  targetFPS(() => {
    /* ... */
  }, 60),
  true,
);

addSampler();
addDraw();
// `running()` updates once the write is flushed (tracked reads update automatically)
flush();
running(); // true, both run in the same frame
```

> **Warning** Only use this when callbacks must run in the same frame, and keep each callback short: all of them share one frame's budget. To control several separate loops, use `createCallbacksSet` with your own `createRAF` instead.

## createScheduledLoop

Drives an external frameloop scheduler (for example [motion's `frame`](https://motion.dev/docs/frame)) with the same `[running, start, stop]` shape as `createRAF`. The loop is stopped on cleanup.

`schedule` receives the callback and must keep running it every frame until cancelled, returning an ID (not `null` or `undefined`) that `cancel` accepts. It is called once per `start()`, so a one-shot scheduler like `requestAnimationFrame` only runs the callback once; use `createRAF` for that. motion's `frame.render` returns nothing and `cancelFrame` takes the callback itself, so return the callback as the ID:

```ts
// Type
function createScheduledLoop<
  RequestID extends NonNullable<unknown>,
  Callback extends (...args: Array<any>) => any,
>(
  schedule: (callback: Callback) => RequestID,
  cancel: (requestID: RequestID) => void,
): (callback: Callback) => [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction];

// Example
import { createScheduledLoop } from "@solid-primitives/raf";
import { cancelFrame, frame } from "motion";

const createMotionFrameRender = createScheduledLoop(
  callback => (frame.render(callback, true), callback),
  cancelFrame,
);
const [running, start, stop] = createMotionFrameRender(
  data => (element.style.transform = "translateX(...)"),
);
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
