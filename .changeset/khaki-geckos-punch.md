---
"@solid-primitives/refs": major
---

Major API changes. Bump stage to 2.

`mapRemoved`, `Children`, `unmount`, `refs`, `elements`, `getChangedItems`, `getAddedItems` and `getRemovedItems` has been removed.

Add `getResolvedElements`, `resolveElements`, `getFirstChild` and `resolveFirst` primitives.

Improve `mergeRefs` to allow an array of refs to be passed in.

Ensure SSR support for `resolveElements`, `resolveFirst`, `<Ref>` and `<Refs>`.

Removes `"@solid-primitives/immutable"` dependency.
