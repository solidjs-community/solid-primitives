<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Gestures" alt="Solid Primitives Gestures">
</p>

# @solid-primitives/gestures

[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Ref factory functions for reacting to user gestures via pointer events.

**Coordinate system**: all `{ x, y }` positions returned by these primitives are **element-relative** — measured from the top-left corner of the target element's bounding box.

**Lifecycle**: each factory registers its pointer listeners when the `ref` callback fires and automatically removes them when the Solid component unmounts. The factories must be called inside a Solid component (they call `onCleanup` internally).

## Primitives

- [`pan`](#pan) — fires on single-pointer drag movement within the element bounds
- [`pinch`](#pinch) — fires on two-pointer pinch/spread gestures with scale
- [`rotate`](#rotate) — fires on two-pointer rotation gestures with angle
- [`swipe`](#swipe) — fires when a fast directional swipe is detected
- [`tap`](#tap) — fires on a short, stationary pointer interaction

## Installation

```bash
npm install @solid-primitives/gestures
# or
pnpm add @solid-primitives/gestures
```

## Usage

All primitives are **ref factory functions** — call them with props and pass the result to `ref`:

```tsx
import { pan, swipe, tap, pinch, rotate } from "@solid-primitives/gestures";

function App() {
  return (
    <div
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

Calls `callback` continuously as a single pointer moves within the element. The callback is **not** called when the pointer leaves the element rect.

```ts
pan(props: PanProps): (node: HTMLElement) => void

type PanProps = {
  callback: (position: { x: number; y: number }) => void;
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

Calls `callback` as two pointers rotate around their midpoint. `rotation` is in degrees relative to the initial angle when the second pointer was placed, clamped to the range **–180..180**.

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
  maximumTapLength?: number; // max ms the pointer may be held before it is no longer a tap (default: none)
};
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Contributors

Ported from the amazing work by at https://github.com/Rezi/svelte-gestures.
