# @solid-primitives/connectivity

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/connectivity?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![version](https://img.shields.io/npm/v/@solid-primitives/connectivity?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/davedbase/solid-primitives#contribution-process)

A [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/Online_and_offline_events) signal that tells you when the browser _thinks_ you're online. Connectivity is determined by your browser, which is a best-effort process.

## Installation

```bash
npm install @solid-primitives/connectivity
# or
yarn add @solid-primitives/connectivity
```

## How to use it

```ts
const online = createConnectivitySignal();
console.log(online());
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

</details>
