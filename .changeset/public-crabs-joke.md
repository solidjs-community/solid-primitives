---
"@solid-primitives/focus": minor
---

Add `createFocusGroup` — creates a focus group for moving focus imperatively (`focusNext`/`focusPrevious`/`focusFirst`/`focusLast`) between the focusable/tabbable elements of a container, with arrow-key/Home/End/Tab keyboard navigation enabled by default (a `keydown` listener attached to the group's ref, removed on ref change or disposal). Useful for building menus, listboxes, toolbars, and other composite widgets that need roving-tabindex-style navigation.

Options split into two groups: `from`, `tabbable`, `wrap`, and `accept` are traversal options that can be passed per-method-call or as defaults (the second argument to `createFocusGroup`); `orientation`, `textDirection`, `handleTab`, and `keyboardNavigation` are group-level keyboard options read only from those defaults.

Radio button groups are handled per native semantics: with `tabbable: true`, only one `<input type="radio">` per same-`name` group is tabbable at a time (the checked one, or the first if none is checked), matching browser roving-tabindex behavior for radio groups.
