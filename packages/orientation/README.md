<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=orientation" alt="Solid Primitives orientation">
</p>

# @solid-primitives/orientation

[![size](https://img.shields.io/badge/size-489_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/orientation)
[![version](https://img.shields.io/npm/v/@solid-primitives/orientation?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/orientation)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for tracking screen orientation via the [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API).

- [`makeOrientation`](#makeorientation) — Non-reactive listener; attaches a callback for each orientation change and returns a cleanup function.
- [`createOrientation`](#createorientation) — Reactive primitive; returns `angle` and `type` as signal accessors that update on orientation change.

## Installation

```bash
npm install @solid-primitives/orientation
# or
yarn add @solid-primitives/orientation
# or
pnpm add @solid-primitives/orientation
```

## `makeOrientation`

A non-reactive base primitive. Attaches a listener for screen orientation changes and returns a cleanup function. The callback fires on every subsequent change but **not** on mount — use `createOrientation` if you need the initial value reactively.

Uses `screen.orientation` when available, falling back to the legacy `orientationchange` event on `window`.

```ts
import { makeOrientation } from "@solid-primitives/orientation";

const cleanup = makeOrientation(({ angle, type }) => {
  console.log(angle); // 0 | 90 | 180 | 270
  console.log(type);  // "portrait-primary" | "landscape-primary" | ...
});

// remove listener when done
cleanup();
```

## `createOrientation`

A reactive primitive that tracks the screen orientation. Returns `angle` and `type` signal accessors, initialized to the current orientation and updated on every change. Automatically removes the event listener on cleanup.

On the server, returns static defaults: `angle: 0`, `type: "portrait-primary"`.

```ts
import { createOrientation } from "@solid-primitives/orientation";
import { createEffect } from "solid-js";

const { angle, type } = createOrientation();

createEffect(
  () => ({ angle: angle(), type: type() }),
  ({ angle, type }) => {
    console.log(angle); // 0 | 90 | 180 | 270
    console.log(type);  // "portrait-primary" | "landscape-primary" | ...
  }
);
```

## Types

```ts
export type OrientationType =
  | "landscape-primary"
  | "landscape-secondary"
  | "portrait-primary"
  | "portrait-secondary"
  | "unknown";

export interface OrientationState {
  readonly angle: number;
  readonly type: OrientationType;
}
```

## Browser Support

`screen.orientation` is supported in Chrome 38+, Firefox 43+, and Safari 16.4+. On older browsers the primitive falls back to the deprecated `window.orientationchange` event.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
