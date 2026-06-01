<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Permission" alt="Solid Primitives Permission">
</p>

# @solid-primitives/permission

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/permission?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/permission)
[![size](https://img.shields.io/npm/v/@solid-primitives/permission?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/permission)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive wrapper around the browser [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API). Queries a named permission and returns a live signal that updates automatically whenever the permission state changes.

## Installation

```bash
npm install @solid-primitives/permission
# or
yarn add @solid-primitives/permission
# or
pnpm add @solid-primitives/permission
```

## How to use it

### `createPermission`

Queries a browser permission by name (or descriptor object) and returns a reactive accessor reflecting its current state.

```ts
import { createPermission } from "@solid-primitives/permission";

const permission = createPermission("microphone");
// permission(): "unknown" | "granted" | "denied" | "prompt"
```

The signal starts as `"unknown"` — the Permissions API query is async and the initial value is not available synchronously. After the first microtask, the signal resolves to the current state and begins tracking changes.

The signal updates automatically when the permission changes — for example when the user grants or revokes access in browser settings, or after an API call prompts the user.

**Accepted values** follow the [PermissionName](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query#name) vocabulary. Pass either a plain string or a full `PermissionDescriptor` object:

```ts
// Plain name
const mic = createPermission("microphone");

// Descriptor object (required for some permissions)
const cam = createPermission({ name: "camera" });

// Used by @solid-primitives/notification
const notifs = createPermission("notifications");
```

**Return values** map to [PermissionState](https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus/state):

| Value | Meaning |
|-------|---------|
| `"unknown"` | Initial state — query has not resolved yet |
| `"granted"` | Permission has been granted |
| `"denied"` | Permission has been denied |
| `"prompt"` | Not yet asked; prompting the user is possible |

### SSR

On the server, `createPermission` returns a static `() => "unknown"` accessor. No query is made and no listeners are registered.

### Reactive usage example

```tsx
import { createPermission } from "@solid-primitives/permission";

const CameraGate: Component = () => {
  const permission = createPermission("camera");

  return (
    <Switch>
      <Match when={permission() === "unknown"}>
        <p>Checking camera permission…</p>
      </Match>
      <Match when={permission() === "granted"}>
        <CameraFeed />
      </Match>
      <Match when={permission() === "denied"}>
        <p>Camera access denied. Enable it in browser settings.</p>
      </Match>
      <Match when={permission() === "prompt"}>
        <button onClick={() => navigator.mediaDevices.getUserMedia({ video: true })}>
          Allow camera
        </button>
      </Match>
    </Switch>
  );
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
