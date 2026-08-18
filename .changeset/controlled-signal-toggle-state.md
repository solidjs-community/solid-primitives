---
"@solid-primitives/controlled-signal": minor
---

Add `createToggleState` — controllable state for toggle components (checkboxes, switches, toggle buttons), with `isSelected`/`setIsSelected`/`toggle` plus `isDisabled`/`isReadOnly` guards, built on top of `createControllableBooleanSignal`. Adapted from Kobalte's `createToggleState`, which independently needed this exact primitive. See https://github.com/solidjs-community/solid-primitives/issues/280.
