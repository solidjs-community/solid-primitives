---
"@solid-primitives/keyboard": minor
---

Add `createShortcuts` and `makeShortcutRegistry`: register many keyboard shortcuts through a single keydown/keyup listener pair, with dynamic registration, per-shortcut `enabled`/`ignoreInputs`/`requireReset`/`preventDefault`, an optional scope element, and a deterministic conflict policy (most recently registered eligible shortcut wins). `createShortcut` is unchanged.
