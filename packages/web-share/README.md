<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=web-share" alt="Solid Primitives web-share">
</p>

# @solid-primitives/web-share

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/web-share?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![version](https://img.shields.io/npm/v/@solid-primitives/web-share?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fweb-share%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

This primitive is designed to use [WebShare API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) easy.

## Installation

```bash
npm install @solid-primitives/web-share
# or
yarn add @solid-primitives/web-share
# or
pnpm add @solid-primitives/web-share
```

## How to use it

### makeWebShare

```ts
const share = makeWebShare();

try {
  await share({ url: "https://solidjs.com" });
} catch (e) {
  console.log(e);
}
```

### createWebShare

```ts
const [shareData, setShareData] = createSignal({});
const shareStatus = createWebShare(shareData);

console.log(shareStatus.status, shareStatus.message);
```

## Demo

TODO

## Changelog

TODO
