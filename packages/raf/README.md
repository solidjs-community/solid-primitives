<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=RAF" alt="Solid Primitives RAF">
</p>

# @solid-primitives/raf

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/raf?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/raf)
[![size](https://img.shields.io/npm/v/@solid-primitives/raf?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/raf)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive primitives providing support to `window.requestAnimationFrame`.

- [`createRAF`](#createRAF) - Creates an auto-disposing requestAnimationFrame loop.
- [`targetFPS`](#targetFPS) - Used to limit the FPS of [`createRAF`](#createRAF)

## Installation

```
npm install @solid-primitives/raf
# or
yarn add @solid-primitives/raf
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
  callback: FrameRequestCallback
): [running: Accessor<boolean>, start: Fn, stop: Fn];
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

// the target fps value can be a reactive sigmal
const [fps, setFps] = createSignal(60);
createRAF(targetFPS((timestamp) => {...}, fps));
```

#### Definition

```ts
function targetFPS(
  callback: FrameRequestCallback,
  fps: MaybeAccessor<number>
): FrameRequestCallback;
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-raf-demo-4xvmjd?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release ported from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useRafFn/useRafFn.ts.

1.0.6

Released official version with CJS and SSR support.

1.0.7

Updated to Solid 1.3, switched to peerDependencies

1.0.9

Patched double running and added refresh rate warning (patch by [titoBouzout](https://www.github.com/titoBouzout)).

2.0.0

Patch by [titoBouzout](https://www.github.com/titoBouzout):

- allow to limit fps above 60fps
- remove `runImmediately` – animation loop will have to be initialized manually.
- respect `requestAnimationFrame` signature and give `timeStamp` back to the callback instead of a `deltaTime`
- use cancelAnimationFrame instead of !isRunning

Patch by [thetarnav](https://www.github.com/thetarnav):

- Move FPS limiting feature into a separate `targetFPS` primitive

</details>
