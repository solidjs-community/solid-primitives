---
"@solid-primitives/notification": minor
---

Add `@solid-primitives/notification` package (Stage 0)

New primitives for the browser [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).

- **`isNotificationSupported()`** — SSR-safe runtime check for Notifications API availability.
- **`makeNotification(title, options?)`** — Non-reactive helper returning `[show, close]`. `show()` creates and returns a `Notification` instance (or `null` when permission is not `"granted"`); calling it again replaces the previous notification. No Solid lifecycle dependency.
- **`createNotification(title, options?)`** — Reactive primitive returning `{ show, close, notification, supported }`. Accepts reactive accessors for `title` and `options` — their current values are read at `show()` time. The `notification` accessor tracks the live instance, updating to `null` when it is dismissed by the OS or closed programmatically. Cleans up automatically on owner disposal.
- **`createNotificationPermission()`** — Reactive permission manager returning `{ permission, requestPermission }`. The `permission` accessor reflects `Notification.permission` and updates after each `requestPermission()` call. Degrades gracefully to `"denied"` on the server.

Peer dependencies: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10`.
