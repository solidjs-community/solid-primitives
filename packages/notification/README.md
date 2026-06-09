<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=notification" alt="Solid Primitives notification">
</p>

# @solid-primitives/notification

[![size](https://img.shields.io/badge/size-1.22_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/notification)
[![version](https://img.shields.io/npm/v/@solid-primitives/notification?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/notification)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- [**Docs**](https://primitives.solidjs.community/docs/notification)

Primitives for the browser [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) with reactive permission management.

- **`isNotificationSupported`** — SSR-safe check for Notifications API availability.
- **`makeNotification`** — Non-reactive helper returning `[show, close]`. No Solid lifecycle dependency.
- **`createNotification`** — Reactive primitive that tracks the live `Notification` instance and cleans up on owner disposal.
- **`createNotificationPermission`** — Reactive permission manager that exposes a live permission signal and a `requestPermission` function.

## Installation

```bash
npm install @solid-primitives/notification
# or
yarn add @solid-primitives/notification
# or
pnpm add @solid-primitives/notification
```

## How to use it

### `isNotificationSupported`

Returns `true` when the Notifications API is available. Always `false` on the server.

```ts
import { isNotificationSupported } from "@solid-primitives/notification";

if (isNotificationSupported()) {
  console.log("notifications available");
}
```

---

### `makeNotification`

Non-reactive helper with no Solid lifecycle dependency. Both returned functions are no-ops when the API is unavailable.

`show()` returns `null` when `Notification.permission` is not `"granted"` — use `createNotificationPermission` to request permission first.

Because `makeNotification` has no reactive owner, **cleanup is the caller's responsibility**. Inside a reactive scope, register `close` with `onCleanup`:

```ts
import { onCleanup } from "solid-js";
import { makeNotification } from "@solid-primitives/notification";

const [show, close] = makeNotification("New message", { body: "Hello!" });

// Register cleanup with the current reactive owner
onCleanup(close);

button.addEventListener("click", () => show());

// Or close programmatically at any time
close();
```

Outside a reactive scope (e.g. in plain event handlers), call `close()` directly when done.

---

### `createNotification`

Reactive primitive tied to the current reactive owner.

- `title` and `options` can be plain values **or** reactive accessors — their current values are read each time `show()` is called.
- `notification` is a reactive `Accessor<Notification | null>` that reflects the live instance, updating to `null` when the notification is dismissed (either programmatically or by the OS).
- The notification is automatically closed when the reactive owner is disposed.
- Pass an optional `handlers` object to respond to notification events.

```ts
import { createEffect } from "solid-js";
import { createNotification } from "@solid-primitives/notification";

const { show, close, notification, supported } = createNotification(
  () => `You have ${unread()} messages`,
  { icon: "/icon.png" },
  {
    onClick: n => { window.focus(); },
    onClose: n => { console.log("dismissed"); },
    onError: n => { console.error("notification failed"); },
  },
);

// Show a notification (reads reactive title at call time)
show();

// React to visibility changes
createEffect(() => {
  if (notification()) console.log("notification visible");
  else console.log("notification gone");
});

// Close programmatically
close();
```

---

### `createNotificationPermission`

Reactive permission manager built on the browser [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API).

The `permission` accessor reflects the **live** permission state and updates automatically whenever it changes — including after `requestPermission()` resolves or the user edits their browser settings directly.

Permission values follow Permissions API vocabulary: `"granted"`, `"denied"`, `"prompt"` (not yet asked), or `"unknown"` while the initial async query is still resolving. Note that the Notifications API uses `"default"` for the same concept that the Permissions API calls `"prompt"`.

On the server or when the API is unavailable, `permission` always returns `"unknown"` and `requestPermission` resolves immediately without effect.

```ts
import { Show } from "solid-js";
import { createNotificationPermission } from "@solid-primitives/notification";

const { permission, requestPermission } = createNotificationPermission();

// Gate UI on permission state
<Show when={permission() !== "granted"}>
  <button onClick={requestPermission}>Enable notifications</button>
</Show>

// Call without expecting a return value — permission() updates reactively after it resolves
requestPermission();
```

---

### Full example

```tsx
import { Component, Show } from "solid-js";
import {
  createNotification,
  createNotificationPermission,
  isNotificationSupported,
} from "@solid-primitives/notification";

const NotificationDemo: Component = () => {
  const { permission, requestPermission } = createNotificationPermission();
  const { show, close, notification } = createNotification(
    "Solid Primitives",
    { body: "Hello from SolidJS!" },
    { onClick: () => window.focus() },
  );

  return (
    <Show when={isNotificationSupported()} fallback={<p>Not supported</p>}>
      <p>Permission: {permission()}</p>
      <p>Active: {notification() ? "yes" : "no"}</p>
      <Show when={permission() !== "granted"}>
        <button onClick={requestPermission}>Request permission</button>
      </Show>
      <button onClick={() => show()}>Show</button>
      <button onClick={close}>Close</button>
    </Show>
  );
};
```

## Types

```ts
/** Event handler callbacks for `createNotification`. */
type NotificationEventHandlers = {
  /** Called when the user clicks the notification. */
  onClick?: (notification: Notification) => void;
  /** Called when the notification is dismissed, whether by the user, the OS, or `close()`. */
  onClose?: (notification: Notification) => void;
  /** Called when the notification fails to display. */
  onError?: (notification: Notification) => void;
};
```

## Browser Support

The [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API#browser_compatibility) is supported in all modern browsers. It is not available in iOS Safari (as of 2025) or on the server. All primitives degrade gracefully — `show()` returns `null`, `close()` is a no-op, and `permission()` returns `"unknown"`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
