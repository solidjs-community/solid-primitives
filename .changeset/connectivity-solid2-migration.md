---
"@solid-primitives/connectivity": major
---

Migrate to Solid.js v2.0 (beta.14) and add Network Information API primitives.

## New

- `makeNetworkInformation(callback)` — low-level listener combining `window` online/offline events with `navigator.connection` change events; fires a `NetworkState` snapshot on any change
- `createNetworkInformation()` → `{ online, downlink, downlinkMax, effectiveType, rtt, saveData, type }` — independent reactive signals for the full network state; useful for adaptive loading strategies
- `useNetworkInformation()` — singleton root variant of `createNetworkInformation`
- Exported types: `NetworkState`, `NetworkInformationReturn`, `EffectiveConnectionType`, `ConnectionType`

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

- `isServer` is now sourced from `@solidjs/web` internally (no user-facing API change)
- The internal connectivity signal uses `ownedWrite: true` to support event listeners that may fire synchronously within reactive scopes
