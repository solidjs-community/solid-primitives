---
"@solid-primitives/event-listener": patch
"@solid-primitives/pagination": patch
---

Republish only, no functional changes. `event-listener@3.0.0-next.4` and `pagination@1.0.0-next.7` were accidentally published to npm with an unresolved pnpm workspace-catalog protocol string (`"catalog:peer"`) left in `peerDependencies`, instead of a resolved semver range. npm and yarn have no concept of the `catalog:` protocol, so installing either of those exact versions fails with `EUNSUPPORTEDPROTOCOL`. This release republishes both packages with `peerDependencies` correctly resolved (e.g. `"solid-js": "^2.0.0-rc.0"`). If you're on `event-listener@3.0.0-next.4` or `pagination@1.0.0-next.7`, upgrade to this version or later.
