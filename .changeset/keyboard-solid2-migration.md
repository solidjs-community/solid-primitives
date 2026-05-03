---
"@solid-primitives/keyboard": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### Removed deprecated tuple API from `useKeyDownList`

The old destructuring form is no longer supported:

```ts
// ❌ removed
const [keys, { event }] = useKeyDownList();

// ✅ use the dedicated primitives instead
const keys = useKeyDownList();
const event = useKeyDownEvent();
```

### `isServer` import source

`isServer` is now sourced from `@solidjs/web` instead of `solid-js/web` (handled internally — no consumer change needed).

### `createShortcut` — synchronous `preventDefault`

`createShortcut` now registers a direct `keydown` event listener instead of using a reactive effect. This fixes `preventDefault` calling correctly within the same event dispatch, which was not guaranteed with Solid 2.0's deferred effect scheduling.

### `createKeyHold` — side-effect-free memo

The `preventDefault` side effect has been moved out of the reactive `createMemo` into a dedicated `keydown` listener, aligning with Solid 2.0's guidance against side effects in memos.
