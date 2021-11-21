---
Name: share
Stage: 2
Package: "@solid-primitives/share"
Primitives: createSocialShare
Category: Utilities
---

# @solid-primitives/share

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/share?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/share)
[![size](https://img.shields.io/npm/v/@solid-primitives/share?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/share)

Primitives for supporting sharing of resources on social media and beyond.

`createSocialShare` - Provides a getter and setter for the primitive.

A portion of this primitive was built off of https://github.com/nicolasbeauvais/vue-social-sharing/blob/master/src/share-network.js.

## How to use it

```ts
import createSocialShare from "@solid-promitives/share";
import { facebook } from "@solid-promitives/share/networks";
const [share, close] = createSocialShare(facebook);
```

## Demo

You may view a working example here: [ link to Stackblize or CodeSandBox ]

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
