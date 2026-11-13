---
"@solid-primitives/match": patch
---

Rework the `MatchTag` and `MatchValue` signatures so a missing (or unknown) case is reported directly on the `case` prop (e.g. `Property 'bar' is missing in type ...`) instead of as the misleading error of an unrelated overload (e.g. `Property 'type' is missing ...` when using a custom `tag`). Callbacks keep their contextual types even while a case is missing. Inference for the default `type` tag, a custom `tag` prop and `partial` is unchanged, and `partial` still works with explicit type arguments. Passing a custom tag key as an explicit type argument (`<MatchTag<MyUnion, "kind">>`) now also requires the `tag` prop, and a non-literal `partial={boolean}` is treated as non-partial. Numeric tag values (`tag="t"` with `t: 1 | 2`) now type-check. No runtime changes. (#1055)
