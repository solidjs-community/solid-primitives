---
"@solid-primitives/lifecycle": patch
---

Fix `onElementConnect` throwing `CLEANUP_IN_FORBIDDEN_SCOPE` inside a `ref` callback (#1143). It no longer calls `onCleanup` and now returns a disposer. Add `createConnectRef` for `ref` usage that also cleans up with the owner.
