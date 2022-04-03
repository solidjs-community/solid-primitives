<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Share" alt="Solid Primitives Share">
</p>

# @solid-primitives/share

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/share?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/share)
[![size](https://img.shields.io/npm/v/@solid-primitives/share?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/share)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for supporting sharing of resources on social media and beyond.

## Installation

```
npm install @solid-primitives/share
# or
yarn add @solid-primitives/share
```

## How to use it

```ts
import createSocialShare from "@solid-promitives/share";
import { facebook } from "@solid-promitives/share/networks";

const [share, close] = createSocialShare({
  title: "SolidJS.com",
  url: "https://www.solidjs.com",
  description: "Simple and performant reactivity!"
});
share(facebook);
```

## Demo

You may view a working example here: [ link to Stackblitz or CodeSandBox ]

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

0.0.105

Added CJS and SSR support.

0.0.150

Updated to Solid 1.3

</details>

## Acknowledgements

A portion of this primitive was built from https://github.com/nicolasbeauvais/vue-social-sharing/blob/master/src/share-network.js.
