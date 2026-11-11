---
"@solid-primitives/presence": minor
---

Add `done` to the result of `createPresence` (#466): end the current enter or exit transition on the element's `transitionend` / `animationend` (`onTransitionEnd={presence.done}`), or from your own animation code, instead of waiting for a fixed duration. The duration still applies and acts as a fallback timeout when `done` is never called. Events bubbling up from descendants are ignored. `done` ends whichever transition is running when it is called; for completion callbacks of JavaScript animations, which can arrive after their transition was superseded, `bindDone()` returns a `done` bound to the current transition that does nothing once the item has changed again. Opt-in and non-breaking: without `done`, behavior is unchanged.
