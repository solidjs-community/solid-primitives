<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=notification" alt="Solid Primitives notification">
</p>

# @solid-primitives/notification

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/notification?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/notification)
[![version](https://img.shields.io/npm/v/@solid-primitives/notification?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/notification)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for the browser [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) with reactive permission management.

- **`isNotificationSupported`** — SSR-safe check for Notifications API availability.
- **`makeNotification`** — Non-reactive helper returning `[show, close]`. No Solid lifecycle dependency.
- **`createNotification`** — Reactive primitive that tracks the live `Notification` instance and cleans up on owner disposal.
- **`createNotificationPermission`** — Reactive permission manager that exposes a signal and a `requestPermission` function.

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

```ts
import { makeNotification } from "@solid-primitives/notification";

const [show, close] = makeNotification("New message", { body: "Hello!" });

button.addEventListener("click", () => show());

// Close programmatically at any time
close();
```

---

### `createNotification`

Reactive primitive tied to the current reactive owner.

- `title` and `options` can be plain values **or** reactive accessors — their current values are read each time `show()` is called.
- `notification` is a reactive `Accessor<Notification | null>` that reflects the live instance, updating to `null` when the notification is dismissed (either programmatically or by the OS).
- The notification is automatically closed when the reactive owner is disposed.

```ts
import { createNotification } from "@solid-primitives/notification";

const { show, close, notification, supported } = createNotification(
  () => `You have ${unread()} messages`,
  { icon: "/icon.png" },
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

Reactive permission manager. The `permission` accessor updates after each `requestPermission()` call.

On the server or when the API is unavailable, `permission` always returns `"denied"` and `requestPermission` resolves immediately to `"denied"`.

```ts
import { createNotificationPermission } from "@solid-primitives/notification";

const { permission, requestPermission } = createNotificationPermission();

// Gate UI on permission state
<Show when={permission() !== "granted"}>
  <button onClick={requestPermission}>Enable notifications</button>
</Show>

// Await the result
const result = await requestPermission();
// result: "granted" | "denied" | "default"
```

---

### Full example

```tsx
import {
  createNotification,
  createNotificationPermission,
  isNotificationSupported,
} from "@solid-primitives/notification";

const NotificationDemo: Component = () => {
  const { permission, requestPermission } = createNotificationPermission();
  const { show, close, notification } = createNotification("Solid Primitives", {
    body: "Hello from SolidJS!",
  });

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
// Standard DOM type re-exported for convenience
type NotificationPermission = "granted" | "denied" | "default";
```

## Browser Support

The [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API#browser_compatibility) is supported in all modern browsers. It is not available in iOS Safari (as of 2025) or on the server. All primitives degrade gracefully — `show()` returns `null`, `close()` is a no-op.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
