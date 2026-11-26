---
"@solid-primitives/presence": minor
---

Add opt-in animation-aware transitions: `animations: true` waits for `element.getAnimations({ subtree: true })` to settle (CSS transitions, CSS animations, Web Animations) instead of the fixed duration, falling back to the timer when no element is known or `getAnimations` is unavailable. The element comes from the new `element` option or the returned `ref`. Also returns `attrs()` with `data-starting-style` / `data-ending-style` for styling hooks. Fully backward compatible.
