---
"@solid-primitives/presence": minor
---

Add `done` to the result of `createPresence` (#466): end the current enter or exit transition on the element's `transitionend` / `animationend` (`onTransitionEnd={presence.done}`), or from your own animation code, instead of waiting for a fixed duration. The duration still applies and acts as a fallback timeout when `done` is never called. Events bubbling up from descendants are ignored, and a call that arrives after the item changed again does not end the newer transition. Opt-in and non-breaking: without `done`, behavior is unchanged.
