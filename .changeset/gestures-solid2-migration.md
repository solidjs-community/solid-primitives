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
