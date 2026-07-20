---
"@solid-primitives/interaction": minor
---

`createHideOutside`/`ariaHideOutside` gain an opt-in `inert` option — in addition to `aria-hidden`, also sets the `inert` attribute on hidden elements, ref-counted alongside `aria-hidden`. `aria-hidden` alone only affects the accessibility tree; `inert` additionally removes hidden content from focus order, tab order, and pointer/text-selection interaction. Defaults to `false` (no behavior change for existing callers).

Also hardened the module-scope ref-counting/observer-stack state (used internally by both the existing `aria-hidden` tracking and the new `inert` tracking) against duplicate installed copies of this package, via the same `globalRegistry` pattern used in `@solid-primitives/scroll`.
