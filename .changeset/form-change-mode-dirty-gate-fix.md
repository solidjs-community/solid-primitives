---
"@solid-primitives/form": patch
---

Fix `createForm`'s default `validateOn: "change"` mode showing a field's error immediately on mount, before the user had touched it. `error()` was wired directly to the raw, ungated validation result for `"change"` mode, so any field whose initial value failed validation (e.g. a required field starting empty) rendered errored from the first paint.

`"change"` mode's validator error is now gated on per-field dirtiness (`value() !== initial`) — hidden until the field's value actually changes, and hidden again if it's changed back to the initial value. `blur`/`submit` modes are unaffected (still gated on `touched()`/`submitted()` respectively).

Fixing this also surfaced a second, separate bug: the gating was applied to the *combined* raw error, which included any `setError()`-injected external error (e.g. a server-side validation message) — so an external error set on a pristine `"change"`-mode field was incorrectly hidden too. External errors are now always shown immediately regardless of mode/dirty/touched/submitted state, matching their documented purpose (`setError`: "Inject an external error (e.g. from a server response)").

`form.errors()` and `form.valid()` are unaffected either way — both were already, and remain, ungated (true validity regardless of display timing).
