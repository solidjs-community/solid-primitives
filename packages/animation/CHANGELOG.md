# @solid-primitives/animation

## 1.0.0-next.2

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 1.0.0-next.1

### Minor Changes

- de4c1ba: New package. Provides reactive and imperative wrappers for the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) (WAAPI). All primitives follow the `make*` / `create*` convention: `make*` is imperative and returns immediately, `create*` is a reactive wrapper that re-runs on dependency change and cancels on owner disposal.

  - `makeAnimate(el, keyframes, options?)` — thin wrapper around `element.animate()`
  - `createAnimate(target, keyframes, options?)` — reactive `makeAnimate`; re-runs whenever target, keyframes, or options change
  - `makeScrollAnimation(el, keyframes, options?)` — scroll-driven animation via `ScrollTimeline`
  - `createScrollAnimation(target, keyframes, options?)` — reactive `makeScrollAnimation`
  - `makeViewAnimation(el, keyframes, options?)` — viewport-driven animation via `ViewTimeline`; defaults `rangeStart`/`rangeEnd` to the entry phase so initially-visible elements animate correctly
  - `createViewAnimation(target, keyframes, options?)` — reactive `makeViewAnimation`
  - `makeFlip(el, options?)` — FLIP layout animation; `snapshot()` before DOM change, `flip()` after
  - `makeStagger(els, keyframes, options?)` — staggered WAAPI animation across a list of elements with per-element delay offset
  - `createStagger(targets, keyframes, options?)` — reactive `makeStagger`
  - `makeAnimationGroup(animations)` — coordinates a static list of `Animation` objects as a unit; forwards `play`, `pause`, `cancel`, `reverse`, and `finish` to all simultaneously
  - `createAnimationGroup(animations)` — reactive `makeAnimationGroup`; re-derives the group whenever the accessor returns a new list
  - `makeMotionPath(el, path, options?)` — animates an element along a CSS `offset-path` using WAAPI
  - `createMotionPath(target, path, options?)` — reactive `makeMotionPath`
  - `makeSequence(factories)` — chains animation factories into a sequential playlist; each factory is called lazily when its predecessor finishes
  - `createPresenceAnimation(target, show, options)` — manages mount/unmount lifecycle with WAAPI enter/exit animations; element stays mounted until its exit animation completes

## 0.0.1

### Minor Changes

- Initial release. WAAPI-based animation primitives for SolidJS: `makeAnimate`, `createAnimate`,
  `makeScrollAnimation`, `createScrollAnimation`, `makeViewAnimation`, `createViewAnimation`,
  `makeFlip`, `makeStagger`, `createStagger`, `makeAnimationGroup`, `createAnimationGroup`,
  `makeMotionPath`, `createMotionPath`, `makeSequence`, `createPresenceAnimation`.
