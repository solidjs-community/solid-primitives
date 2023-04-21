---
"@solid-primitives/keyboard": minor
---

Add `useKeyDownEvent` primitive

`useKeyDownList` is now returning just the pressed keys signal (the tuple still works, but it's deprecated and will be removed)

Modifier keys that were pressed before the listener was attached are now added to the list of pressed keys with the first keydown event

`createKeyHold` prevents the default behavior of all keydown events if activated

`createShortcut` callback will not receive the event on reset
