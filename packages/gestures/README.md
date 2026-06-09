<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Gestures" alt="Solid Primitives Gestures">
</p>

# @solid-primitives/gestures

[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Ref factory functions for reacting to user gestures via pointer events.

**Coordinate system**: all `{ x, y }` positions returned by these primitives are **element-relative** — measured from the top-left corner of the target element's bounding box. Coordinates can be negative or exceed the element's dimensions during an active gesture.

**Pointer capture**: each primitive captures the pointer on `pointerdown` so gesture events continue to fire even when the pointer moves outside the element.

**Lifecycle**: each factory registers its pointer listeners when the `ref` callback fires and automatically removes them when the Solid component unmounts. The factories must be called **inside a Solid component** — they call `onCleanup` internally.

**`touch-action`**: on touch devices the browser's default scroll and zoom behaviors run in parallel with pointer events. Add `touch-action: none` (or a more specific value like `touch-action: pan-y`) to the element to prevent browser interference with your gesture handlers:

```tsx
<div style={{ "touch-action": "none" }} ref={pan({ callback: onPan })} />
```

## Primitives

- [`pan`](#pan) — fires on single-pointer drag movement
- [`longPress`](#longpress) — fires when a pointer is held stationary past a time threshold
- [`pinch`](#pinch) — fires on two-pointer pinch/spread gestures with scale
- [`rotate`](#rotate) — fires on two-pointer rotation gestures with angle
- [`swipe`](#swipe) — fires when a fast directional swipe is detected
- [`tap`](#tap) — fires on a short, stationary pointer interaction
- [`doubleTap`](#doubletap) — fires when two taps land in quick succession at the same location

## Installation

```bash
npm install @solid-primitives/gestures
# or
pnpm add @solid-primitives/gestures
# or
yarn add @solid-primitives/gestures
```

## Usage

All primitives are **ref factory functions** — call them with props and pass the result to `ref`:

```tsx
import { pan, swipe, tap, pinch, rotate, longPress } from "@solid-primitives/gestures";

function App() {
  return (
    <div
      style={{ "touch-action": "none" }}
      ref={pan({
        callback: ({ x, y }) => console.log("panning at", x, y),
      })}
    >
      drag me
    </div>
  );
}
```

Multiple gesture refs can be combined on the same element using an array:

```tsx
<div ref={[pan({ callback: onPan }), swipe({ callback: onSwipe })]} />
```

---

### `pan`

Calls `callback` continuously as a single pointer moves. Pointer capture keeps events flowing even when the pointer leaves the element during an active drag. The `x`/`y` values are element-relative and may be negative or exceed the element's dimensions.

```ts
pan(props: PanProps): (node: HTMLElement) => void

type PanProps = {
  callback: (position: { x: number; y: number }) => void;
};
```

---

### `longPress`

Calls `callback` once after a pointer has been held stationary for at least `threshold` milliseconds. Cancels if the pointer moves more than `moveThreshold` pixels, is released early, or a second pointer goes down.

```ts
longPress(props: LongPressProps): (node: HTMLElement) => void

type LongPressProps = {
  callback: (position: { x: number; y: number }) => void;
  threshold?: number;     // ms to hold before firing (default: 500)
  moveThreshold?: number; // px of movement that cancels the gesture (default: 10)
};
```

---

### `pinch`

Calls `callback` as two pointers move closer or farther apart. `scale` is relative to the initial distance between the two fingers when the second pointer was placed (1.0 = original distance).

```ts
pinch(props: PinchProps): (node: HTMLElement) => void

type PinchProps = {
  callback: (scale: number, pinchCenter: { x: number; y: number }) => void;
};
```

---

### `rotate`

Calls `callback` as two pointers rotate around their midpoint. `rotation` is in degrees relative to the initial angle when the second pointer was placed, clamped to **–180..180**.

```ts
rotate(props: RotateProps): (node: HTMLElement) => void

type RotateProps = {
  callback: (rotation: number, center: { x: number; y: number }) => void;
};
```

---

### `swipe`

Calls `callback` with the detected swipe direction once a fast unidirectional gesture completes.

Direction is only reported when movement in one axis is **at least twice** the movement in the other axis — purely diagonal gestures are ignored.

```ts
swipe(props: SwipeProps): (node: HTMLElement) => void

type SwipeProps = {
  callback: (direction: "top" | "right" | "bottom" | "left") => void;
  parameters?: {
    timeframe?: number;        // max ms for the gesture to complete (default: 300)
    minSwipeDistance?: number; // min px of travel required (default: 60)
  };
};
```

---

### `tap`

Calls `callback` when a pointer is pressed and released without significant movement (< 4px drift). The returned position is the release point, element-relative.

```ts
tap(props: TapProps): (node: HTMLElement) => void

type TapProps = {
  callback: (position: { x: number; y: number }) => void;
  minimumTapLength?: number; // min ms the pointer must be held (default: 0)
  maximumTapLength?: number; // max ms before the interaction is no longer considered a tap (default: none)
};
```

---

---

### `doubleTap`

Calls `callback` when two taps land within `timeframe` ms and `positionThreshold` px of each other. A single tap never fires the callback — no delay is imposed on other gesture handlers. Cancels if a second pointer goes down between the two taps.

```ts
doubleTap(props: DoubleTapProps): (node: HTMLElement) => void

type DoubleTapProps = {
  callback: (position: { x: number; y: number }) => void;
  timeframe?: number;          // ms window for second tap (default: 300)
  positionThreshold?: number;  // max px between tap positions (default: 30)
};
```

---

## Installation

```bash
npm install @solid-primitives/gestures
# or
yarn add @solid-primitives/gestures
# or
pnpm add @solid-primitives/gestures
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Contributors

Ported from the amazing work by at https://github.com/Rezi/svelte-gestures.
