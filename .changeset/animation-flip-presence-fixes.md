---
"@solid-primitives/animation": patch
---

Fix several animation bugs:

- `makeFlip`: cancel an in-flight flip before measuring, so interrupting a flip no longer computes the wrong delta; default `fill` to `"backwards"`; document that Solid 2 needs `flush()` between the state change and `flip()`.
- `createPresenceAnimation`: the default exit animation no longer throws for keyframes with `offset` (offsets are mirrored and easings shifted); an externally cancelled exit now unmounts instead of staying mounted forever; the previous enter animation is cancelled when entering again.
- `makeSequence`: skip animations that already finished, and don't cancel a finished animation in `cancel()` (which dropped its `fill` styles).
- `createScrollAnimation` / `createViewAnimation`: return `undefined` instead of throwing where `ScrollTimeline` / `ViewTimeline` is unsupported.
- `createAnimationGroup`: drop the unnecessary memo.
- `makeMotionPath`: add an `anchor` option (default `"center"`) for `offset-anchor`.
