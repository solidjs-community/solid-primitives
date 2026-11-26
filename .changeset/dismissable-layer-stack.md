---
"@solid-primitives/dismissable": minor
---

New package: `@solid-primitives/dismissable`

Dismissable layers with a shared layer stack. `makeDismissableLayer` / `createDismissableLayer` handle Escape, outside pointer presses and outside focus (reusing `makeInteractOutside` from `@solid-primitives/interaction`), report a reason (`escape`, `outside-pointer`, `outside-focus`, `programmatic`), and only let the topmost non-persistent layer react so nested layers close one at a time. Supports `dismissible` + `onDismissAttempt`, `exclude`, `persistent` layers, `parent` registration for portaled children and `disableOutsidePointerEvents`. `getLayerStack`, `useLayerStack`, `getTopLayer` and `isTopLayer` expose the stack.
