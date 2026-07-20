# @solid-primitives/notification

## 1.0.0-next.2

### Patch Changes

- b7ef2f3: `createNotificationPermission`'s `requestPermission` now calls `affects(permission)`, so `isPending(permission)` reads `true` for the duration of the request — the standard Solid 2.0 idiom for callers who don't want the existing bespoke `pending` accessor, which is unchanged and kept for backward compatibility.
- Updated dependencies [b7ef2f3]
  - @solid-primitives/utils@7.0.0-next.3

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/permission@2.0.0-next.1
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- cf498ee: Add `@solid-primitives/notification` package (Stage 0)

  New primitives for the browser [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).

  - **`isNotificationSupported()`** — SSR-safe runtime check for Notifications API availability.
  - **`makeNotification(title, options?)`** — Non-reactive helper returning `[show, close]`. `show()` creates and returns a `Notification` instance (or `null` when permission is not `"granted"`); calling it again replaces the previous notification. No Solid lifecycle dependency.
  - **`createNotification(title, options?)`** — Reactive primitive returning `{ show, close, notification, supported }`. Accepts reactive accessors for `title` and `options` — their current values are read at `show()` time. The `notification` accessor tracks the live instance, updating to `null` when it is dismissed by the OS or closed programmatically. Cleans up automatically on owner disposal.
  - **`createNotificationPermission()`** — Reactive permission manager returning `{ permission, requestPermission }`. The `permission` accessor reflects `Notification.permission` and updates after each `requestPermission()` call. Degrades gracefully to `"unknown"` on the server or when the Notifications API is unsupported.

  Peer dependencies: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14`.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
- Updated dependencies [88833b5]
  - @solid-primitives/utils@7.0.0-next.0
  - @solid-primitives/permission@2.0.0-next.0
