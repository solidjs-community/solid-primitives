<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Page%20Utilities" alt="Solid Primitives Page Utilities">
</p>

# @solid-primitives/page-utilities

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/page-utilities?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/page-utilities)
[![size](https://img.shields.io/npm/v/@solid-primitives/page-utilities?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/page-utilities)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for tracking page visibility and intercepting navigation away from the page.

- [`createPageVisibility`](#createpagevisibility) - Reactive signal tracking whether the page is currently visible
- [`usePageVisibility`](#usepagevisibility) - Shared [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) version of `createPageVisibility`
- [`makePageLeave`](#makepageleave) - Intercepts `beforeunload` to prevent navigation; returns a manual cleanup function
- [`createPageLeaveBlocker`](#createpageleaveblocker) - Reactive version of `makePageLeave`; accepts a signal to toggle prevention

## Installation

```bash
npm install @solid-primitives/page-utilities
# or
yarn add @solid-primitives/page-utilities
# or
pnpm add @solid-primitives/page-utilities
```

## `createPageVisibility`

Returns a reactive boolean signal reflecting the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) — `true` when the page is visible, `false` when hidden or in a prerender state. On the server it always returns `true`.

```ts
import { createPageVisibility } from "@solid-primitives/page-utilities";

const visible = createPageVisibility();

createEffect(() => {
  console.log(visible()); // => boolean
});
```

### Definition

```ts
function createPageVisibility(): Accessor<boolean>;
```

## `usePageVisibility`

A [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) version of `createPageVisibility`. The underlying event listener and signal are shared across all callers, making it more efficient when used in multiple places simultaneously.

```ts
import { usePageVisibility } from "@solid-primitives/page-utilities";

const visible = usePageVisibility();

createEffect(() => {
  console.log(visible()); // => boolean
});
```

### Definition

```ts
const usePageVisibility: () => Accessor<boolean>;
```

## `makePageLeave`

Intercepts the browser's [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) event to show a confirmation dialog when the user attempts to close the tab, refresh, or navigate away. Returns a cleanup function to remove the listener.

```ts
import { makePageLeave } from "@solid-primitives/page-utilities";

const cleanup = makePageLeave();

// remove the listener when done
cleanup();
```

### Definition

```ts
function makePageLeave(): VoidFunction;
```

## `createPageLeaveBlocker`

Reactive version of `makePageLeave`. Accepts an optional `enabled` parameter — a static boolean or a reactive signal — to toggle prevention on and off. Defaults to `true`. Automatically removes the listener when the reactive owner is disposed. No-ops on the server.

```ts
import { createPageLeaveBlocker } from "@solid-primitives/page-utilities";

// Always block navigation
createPageLeaveBlocker();
```

A common pattern is gating on unsaved state:

```ts
const [isDirty, setIsDirty] = createSignal(false);

createPageLeaveBlocker(isDirty);
```

### Definition

```ts
function createPageLeaveBlocker(enabled?: MaybeAccessor<boolean>): void;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
