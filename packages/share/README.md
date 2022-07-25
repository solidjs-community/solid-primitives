<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Share" alt="Solid Primitives Share">
</p>

# @solid-primitives/share

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
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

See [CHANGELOG.md](.\CHANGELOG.md)

## Acknowledgements

A portion of this primitive was built from https://github.com/nicolasbeauvais/vue-social-sharing/blob/master/src/share-network.js.
