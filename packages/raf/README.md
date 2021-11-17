---
Name: raf
Package: "@solid-primitives/raf"
Primitives: createRAF
---

# @solid-primitives/raf

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/raf)](https://bundlephobia.com/package/@solid-primitives/raf)
[![size](https://img.shields.io/npm/v/@solid-primitives/raf)](https://www.npmjs.com/package/@solid-primitives/raf)

Creates a primitive to support requestAnimationFrame.

## How to use it

```ts
const [running, start, stop] = createRAF(() => console.log('hi')));
start();
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-create-raf-czd1e?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release ported from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useRafFn/useRafFn.ts.

</details>
