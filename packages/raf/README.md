# @solid-primitives/raf

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/raf?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/raf)
[![size](https://img.shields.io/npm/v/@solid-primitives/raf?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/raf)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a primitive to support requestAnimationFrame.

## Installation

```
npm install @solid-primitives/raf
# or
yarn add @solid-primitives/raf
```

## How to use it

```ts

// createRAF(callback fn, targetFPS number, runImmediately bool)

const [running, start, stop] = createRAF((timeElapsed) => console.log('hi from RAF, timeElapsed is', timeElapsed)));
start();
console.log('is running? ' + running() ? 'YES' : 'NO')
stop();
console.log('is running? ' + running() ? 'YES' : 'NO')
```

## Warning

To respect clients refresh rate, timeElapsed should be used to calculate how much the animation should progress in a frame, otherwise the animation will run faster on high refresh rate screens. As an example: A screen refreshing at 300fps will run the animations 5x faster than a screen with 60fps if you use other forms of time keeping. See https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

## Demo

You may view a working example here: https://codesandbox.io/s/solid-create-raf-czd1e?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release ported from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useRafFn/useRafFn.ts.

1.0.6

Released official version with CJS and SSR support.

1.0.7

Updated to Solid 1.3, switched to peerDependencies

</details>
