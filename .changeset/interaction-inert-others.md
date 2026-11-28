---
"@solid-primitives/interaction": minor
---

Add `makeInertOthers` and `createInertOthers`: mark every subtree outside one or more modal layer elements as `aria-hidden` and/or `inert`, with restoration of previous attribute values, ref-counted stacking of layers, an `ignore` list, live-region protection and a `MutationObserver` that also covers nodes added later. Their shared state lives on `globalThis`, so duplicate copies of the package stay consistent. Protected elements inside a target no longer get their siblings hidden, a root equal to a target is handled, live regions added later inside hidden branches are re-evaluated, and `createInertOthers` keeps its stack position when its inputs change (stacking order is opening order: re-enabling a layer puts it on top). `aria-hidden` is deferred on nodes that contain the focused element until focus leaves them, because Chrome ignores it there, and when every target is removed the layer keeps what it holds until it is updated or closed. `ariaHideOutside` and `createHideOutside` are unchanged.

`makeInteractOutside` (and `createInteractOutside` / `interactOutside`) no longer leave a touch press armed after it turns into a scroll or drag: the pending touch is dropped on `pointercancel` / `touchcancel`, on movement beyond 10px, on a key press and after a short timeout, and the click must match the stored press.
