---
"@solid-primitives/gestures": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` is now required.

- All gesture primitives have been converted from Solid v1 `use:` directives to **ref factory functions**. Pass the result of the factory call to the `ref` prop instead of using `use:name`.

  ```tsx
  // Before (Solid v1 directive)
  <div use:pan={{ callback: onPan }} />

  // After (ref factory)
  <div ref={pan({ callback: onPan })} />
  ```

- Props are now passed as **plain objects** rather than accessors. Callbacks can close over reactive state directly if dynamic behavior is needed.

  ```ts
  // Before — directive convention wrapped props in an accessor
  export const pan = (node: HTMLElement, props: () => Props) => { props().callback(...) }

  // After — plain object
  export function pan(props: PanProps): (node: HTMLElement) => void
  ```

- The `declare module "solid-js"` JSX augmentations for `use:pan`, `use:pinch`, `use:rotate`, `use:swipe`, and `use:tap` have been removed (directives no longer exist in Solid v2).

- `PanProps`, `PinchProps`, `RotateProps`, `SwipeProps`, and `TapProps` are now exported named types.

- `tap`: the `minimumTapLength` check now uses `>=` instead of `>`, so `minimumTapLength: 0` (the default) correctly accepts instantaneous taps.

- **`pan` no longer suppresses events outside the element bounds.** With pointer capture now active, coordinates during a drag may be negative or exceed the element's width/height. This is the expected behavior for draggable UIs. Downstream code that previously relied on the implicit bounds gate should add an explicit check.

## New Features

- **`longPress`** — new primitive that fires once after a pointer is held stationary past a configurable `threshold` (default 500ms). Cancels on movement beyond `moveThreshold` (default 10px), early release, or a second pointer down.

- **Pointer capture** — all gesture primitives now call `setPointerCapture` on `pointerdown`. This ensures `pointermove` and `pointerup` events continue to fire on the element even when the pointer leaves its bounds during a gesture, eliminating the "stuck gesture" problem.

- **`touch-action` guidance** — README documents adding `touch-action: none` (or a more specific value) to prevent browser scroll/zoom from interfering with gesture handlers on touch devices.
