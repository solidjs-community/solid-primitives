---
"@solid-primitives/keyboard": minor
---

Add an `ignoreWithinInputs` option to `createShortcut` (resolves #475). When `true`, the shortcut is skipped entirely while focus is on an `input`, `textarea`, `select`, or `contenteditable` element, so it doesn't interrupt typing — previously there was no way to define a single-key shortcut (e.g. `["S"]`) without it firing on every keystroke of that letter in a text field. Disabled by default, so this is non-breaking; combos with a modifier (e.g. `Control+S`) don't need it, since the modifier itself already prevents a character from being typed.
