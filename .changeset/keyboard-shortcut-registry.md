---
"@solid-primitives/keyboard": minor
---

Add `createShortcuts` and `makeShortcutRegistry`: register many keyboard shortcuts through a single keydown/keyup listener pair, with dynamic registration, per-shortcut `enabled`/`ignoreInputs`/`requireReset`/`preventDefault`, an optional scope element, and a deterministic conflict policy (most recently registered eligible shortcut wins). `createShortcut` is unchanged.

Fix pressed-key tracking: keys are now released by the value recorded at keydown per physical key (`event.code`), so releasing Shift before a digit (`!` -> `1`) no longer leaves a stuck key in `useKeyDownList`, `createShortcut` and the registry. A scoped registry now also tracks key releases on `window` and resets when focus leaves the scope, so Tab moving focus out no longer leaves a stuck key. A scope that is not an ancestor of `window` in the event path (a bare `EventTarget`) also listens for keyup on itself, so its releases are seen too.

Key releases are now always tracked on `window` in the capture phase in `useKeyDownList`, `createShortcut` and the registry, so an app handler calling `stopPropagation()` on keyup no longer leaves keys stuck. `CapsLock`, `NumLock` and `ScrollLock` are ignored (macOS sends only one of keydown/keyup for CapsLock, which broke every shortcut afterwards). `ignoreWithinInputs` / `ignoreInputs` now work for inputs inside iframes and open shadow roots, and a registry scope may be an iframe document.

Holding both physical keys of a modifier (for example ControlLeft and ControlRight) no longer drops the modifier from the pressed set when only one of them is released while its event flag (`ctrlKey`, `shiftKey`, `altKey`, `metaKey`) is still set. Previously a `requireReset` shortcut could fire again before every key was released, and `useKeyDownList` briefly omitted the held modifier.

**Behavior change:** `ignoreWithinInputs` (`createShortcut`) and `ignoreInputs` (registry) no longer suppress shortcuts while an `<input>` whose type never accepts typed characters has focus: `checkbox`, `button`, `submit`, `reset` and `image` (case-insensitive). Previously every `<input>` was treated as editable. Text-like inputs, `radio`, `range`, `file`, `color`, `textarea`, `select` and `contenteditable` are still ignored, since they consume typed characters or keys such as arrows.
