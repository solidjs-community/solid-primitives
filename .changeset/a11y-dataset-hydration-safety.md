---
"@solid-primitives/a11y": patch
---

`createFormControl`'s `dataset` accessor is now a plain getter instead of a `createMemo` — no behavior or type change, but it removes an unnecessary render-body compute-form memo (memoizing a handful of cheap string/undefined fields buys nothing) that would otherwise consume a hydration id in every consuming app.
