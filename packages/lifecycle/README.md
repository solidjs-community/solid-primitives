<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=lifecycle" alt="Solid Primitives lifecycle">
</p>

# @solid-primitives/lifecycle

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/lifecycle?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/lifecycle)
[![version](https://img.shields.io/npm/v/@solid-primitives/lifecycle?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/lifecycle)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Package providing extra layer of lifecycle primitives for Solid.

- [`createIsMounted`](#createIsMounted) - Returns a boolean signal indicating whether the component is mounted or not.
- [`isHydrating`](#isHydrating) - A signal accessor indicating if the owner is currently hydrating.
- [`isHydrated`](#isHydrated) - A signal with the same behavior as [`isHydrating`](#isHydrating) but this one focused only on client-side updates.
- [`onConnect`](#onConnect) - Calls the given callback when the target element is connected to the DOM.

## Installation

```bash
npm install @solid-primitives/lifecycle
# or
yarn add @solid-primitives/lifecycle
# or
pnpm add @solid-primitives/lifecycle
```

## `createIsMounted`

Returns a boolean signal indicating whether the component is mounted or not.

```tsx
import { createIsMounted } from "@solid-primitives/lifecycle";

const isMounted = createIsMounted();
const windowWidth = createMemo(() => (isMounted() ? ref.offsetWidth : 0));

let ref: HTMLElement;
<div ref={ref}>{windowWidth()}</div>;
```

## `isHydrating`

A signal accessor indicating if the owner is currently hydrating.

- `true` if the SSR process is for a hydratable markup
- `false` if the SSR process isn't for a hydratable markup (e.g. under `<NoHydration>`)
- `true` on the client if the component evaluation is during a hydration process.
- `false` on the client if the component evaluates after hydration or during clinet-side rendering.

If it returns `false` it means that you can safely change the initial values of signals
that are used in the JSX, without causing a mismatch between the server and client.

```tsx
import { isHydrating } from "@solid-primitives/lifecycle";

const [show, setShow] = createSignal(true);

if (!isHydrating()) {
  // this would cause a mismatch on the client if the component is hydrated
  setCount(false);
}

<>{show() && <div>hello</div>}</>;
```

## `isHydrated`

A signal with the same behavior as [`isHydrating`](#isHydrating) but this one focused only on client-side updates.

- `false` during SSR (always)
- `false` on the client if the component evaluation is during a hydration process.
- `true` on the client if the component evaluates after hydration or during clinet-side rendering.

```tsx
import { isHydrated } from "@solid-primitives/lifecycle";

const serverFallback = 0;

const [vw, setVw] = createSignal(
  // if the component is hydrated, we can safely use the window width immediately
  isHydrated() ? window.innerWidth / 100 : serverFallback,
);

<p>Window width: {vw()}vw</p>;
```

### Implementing `ClientOnly` component

```tsx
import { createMemo, FlowComponent, JSX } from "solid-js";
import { isHydrated } from "@solid-primitives/lifecycle";

// This component will only render its children on the client
export const ClientOnly: FlowComponent = props =>
  createMemo(() => isHydrated() && props.children) as unknown as JSX.Element;

// Usage
<ClientOnly>
  <ComponentThatBreaksOnServer />
</ClientOnly>;
```

## `onConnect`

`onMount` is a common lifecycle hook that is used to perform side-effects when the component is mounted.
However, it is not certain that the elements are actually connected to the DOM when the mount callback is called.

> **Note:** If that's the case, it might be a sign that you are executing components that are not visible to the users my mistake.
>
> And if this is something intentional, you probably already have a way to hook into the actual DOM rendering.
>
> If you are not sure, you can use `onConnect` instead of `onMount` to make sure that you are caling your callback when the elements are connected to the DOM.

```tsx
<div
  ref={el => {
    // often false, but will be true during hydration
    el.isConnected;

    onMount(() => {
      // often true, but will be false if the executed component is not actually getting rendered
      el.isConnected;
    });

    onConnect(el, () => {
      // always true
      el.isConnected;
    });
  }}
/>
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
