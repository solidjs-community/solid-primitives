---
"@solid-primitives/interaction": minor
---

Add `makeInertOthers` and `createInertOthers`: mark every subtree outside one or more modal layer elements as `aria-hidden` and/or `inert`, with restoration of previous attribute values, ref-counted stacking of layers, an `ignore` list, live-region protection and a `MutationObserver` that also covers nodes added later. Their shared state lives on `globalThis`, so duplicate copies of the package stay consistent. `ariaHideOutside` and `createHideOutside` are unchanged.
