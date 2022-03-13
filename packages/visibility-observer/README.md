# solid-primitives/visibility-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/visibility-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/visibility-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/visibility-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/visibility-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Provides a reactive page visibility observer.

## Installation

```
npm install @solid-primitives/visibility-observer
# or
yarn add @solid-primitives/visibility-observer
```

## How to use it

### createPageVisibilityObserver

Main page visibility observer primitive.

```ts
const visible = createPageVisibilityObserver();
console.log(visible());
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial commit of the resize observer.

</details>
