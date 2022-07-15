<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Connectivity" alt="Solid Primitives Connectivity">
</p>

# @solid-primitives/connectivity

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/connectivity?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![version](https://img.shields.io/npm/v/@solid-primitives/connectivity?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/Online_and_offline_events) signal that tells you when the browser _thinks_ you're online. Connectivity is determined by your browser, which is a best-effort process.

- [`makeConnectivityListener`](#makeConnectivityListener) - Attaches event listeners and fires callback whenever `window.onLine` changes.
- [`createConnectivitySignal`](#createConnectivitySignal) - A signal representing the browser's interpretation of whether it is on- or offline.

## Installation

```bash
npm install @solid-primitives/connectivity
# or
yarn add @solid-primitives/connectivity
```

## `makeConnectivityListener`

Attaches event listeners and fires callback whenever `window.onLine` changes.

```ts
import { makeConnectivityListener } from "@solid-primitives/connectivity";

const clear = makeConnectivityListener(isOnline => {
  console.log(isOnline); // T: booelan
});
// remove event listeners (happens also on cleanup)
clear();
```

### Definition

```ts
function makeConnectivityListener(callback: (isOnline: boolean) => void): VoidFunction;
```

## `createConnectivitySignal`

A signal representing the browser's interpretation of whether it is on- or offline.

```ts
import { createConnectivitySignal } from "@solid-primitives/connectivity";

const isOnline = createConnectivitySignal();
isOnline(); // T: boolean
```

### `useConnectivitySignal`

This primitive provides a [shared root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot) variant that will reuse event listeners and signals across dependents.

It's behavior is the same as [`createConnectivitySignal`](#createConnectivitySignal).

```ts
import { useConnectivitySignal } from "@solid-primitives/connectivity";

const isOnline = useConnectivitySignal();
isOnline(); // T: boolean
```

### Definition

```ts
function createConnectivitySignal(): Accessor<boolean>;
```

## Demo

https://codesandbox.io/s/solid-primitives-connectivity-demo-2m76q?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

0.1.0

Change primitive name to createConnectivitySignal. Minor adjustments to internal variable naming. Updated to a Stage 1 primitive.

0.1.1

Upgraded to Solid 1.3

0.2.0 - **stage-2**

Add `makeConnectivityListener` and `useConnectivitySignal`

</details>
