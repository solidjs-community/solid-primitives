---
"@solid-primitives/resize-observer": minor
---

Add `clientWidth`/`clientHeight` to `getElementSize` and `createElementSize` (resolves #804). These come from the element's `clientWidth`/`clientHeight` properties (padding-box, excludes border/scrollbar, unaffected by CSS transforms) alongside the existing `width`/`height` (from `getBoundingClientRect`, border-box, affected by CSS transforms). Purely additive — non-breaking.
