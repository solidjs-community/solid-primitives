---
"@solid-primitives/focus": minor
---

Add `createFocusRestore` — saves the currently focused element while active and restores focus to it once deactivated, without trapping focus or managing tab order. For non-modal surfaces (Popover, Tooltip, Menu) that should return focus to their trigger on close but must not intercept Tab navigation while open; for modal dialogs needing both behaviors, use `createFocusTrap`'s existing `restoreFocus` option instead.

Also fixed a stale-closure race shared between `createFocusTrap` and the new `createFocusRestore`: the restore target used to be read from a mutable outer variable inside a deferred `afterPaint` callback, so a fast reactivate-before-restore-fires cycle could restore focus to the wrong element. Both primitives now share one internal helper that captures the target synchronously at deactivation time.
