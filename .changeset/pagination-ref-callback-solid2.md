---
"@solid-primitives/pagination": patch
---

Fix the `createInfiniteScroll` loader throwing `CLEANUP_IN_FORBIDDEN_SCOPE` when used as a JSX `ref` callback (#1143).

The loader called `onCleanup` inside the ref callback, which Solid 2 forbids. It now observes the element (unobserving a previous sentinel) and returns a teardown; observation is also torn down with the owner of `createInfiniteScroll`.
