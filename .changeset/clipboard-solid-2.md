---
"@solid-primitives/clipboard": major
---

Upgrade to Solid 2.0 (`solid-js@^2.0.0-beta.7`).

**`createClipboard`** — replaced `createResource` with a Solid 2.0 async `createMemo`. The accessor starts as `[]` synchronously (no initial suspension) and resolves asynchronously after `refetch()`. Use `isPending(() => clipboard())` for a loading indicator instead of `<Suspense>`.

**`copyToClipboard`** — converted from a `use:` directive to a `ref` directive factory. Replace `use:copyToClipboard={opts}` with `ref={copyToClipboard(opts)}`.

**`isServer`** — moved from `solid-js/web` to `@solidjs/web` in Solid 2.0; the package now imports from `@solidjs/web`.

**`createEffect` + `on`** — `on` helper removed; replaced with the Solid 2.0 split `createEffect(compute, effect)` form with explicit defer-by-default behavior.
