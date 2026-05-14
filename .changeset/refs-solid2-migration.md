---
"@solid-primitives/refs": major
---

Migrate to Solid.js 2.0 (beta.10).

**Breaking changes:**

- Requires `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10`
- Removed deprecated re-exports of `ResolvedChildren` and `ResolvedJSXElement` from `solid-js/types`
- `Refs` and `Ref` components now use split `createEffect` (compute/apply) instead of the removed `createComputed`; the callback fires asynchronously on the next microtask after children change (consistent with Solid 2.0's deferred reactivity model)
