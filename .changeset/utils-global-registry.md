---
"@solid-primitives/utils": minor
---

Add `globalRegistry(key, init)` — returns a singleton value keyed by `key` on `globalThis` (via `Symbol.for`), shared across every copy of the calling module loaded in the same JS realm. Use it instead of a plain module-scope `let`/`const` for state (ref-counts, active-instance stacks) that must stay consistent even if the app's dependency graph ends up with more than one installed copy of a package.
