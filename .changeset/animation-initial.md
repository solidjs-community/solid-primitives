---
"@solid-primitives/animation": minor
---

New package. Provides reactive and imperative wrappers for the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) (WAAPI). All primitives follow the `make*` / `create*` convention: `make*` is imperative and returns immediately, `create*` is a reactive wrapper that re-runs on dependency change and cancels on owner disposal.

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
