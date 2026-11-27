---
"@solid-primitives/dismissable": minor
---

New package: `@solid-primitives/dismissable`

Dismissable layers with a shared layer stack. `makeDismissableLayer` / `createDismissableLayer` handle Escape, outside pointer presses and outside focus (reusing `makeInteractOutside` from `@solid-primitives/interaction`), report a reason (`escape`, `outside-pointer`, `outside-focus`, `programmatic`), and only let the topmost non-persistent layer react so nested layers close one at a time. Supports `dismissible` + `onDismissAttempt`, `exclude`, `persistent` layers, `parent` registration for portaled children and `disableOutsidePointerEvents`. `getLayerStack`, `useLayerStack`, `getTopLayer` and `isTopLayer` expose the stack.

An outside press and the focus move it causes are one interaction (no double `onDismiss` / `onDismissAttempt` for a layer that stays registered), and a touch tap dismisses the layer that was on top when the press began even if the tapped trigger opened a new layer.
