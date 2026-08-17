---
"@solid-primitives/keyboard": minor
---

Add an `anyOrder` option to `createShortcut` (resolves #663). When `true`, the keys can be pressed in any order — e.g. `Shift+Control+M` as well as `Control+Shift+M` — as long as they all end up held down together, matching how most editors (like VS Code) handle shortcuts. Disabled by default, so this is non-breaking; `keys` still has to be pressed in the given order unless the option is set.
