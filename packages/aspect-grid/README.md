<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=aspect-grid" alt="Solid Primitives aspect-grid">
</p>

# @solid-primitives/aspect-grid

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/aspect-grid?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/aspect-grid)
[![version](https://img.shields.io/npm/v/@solid-primitives/aspect-grid?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/aspect-grid)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A primitive meant to align media in a grid.

`createAspectGrid` - provides the style values for a grid with fixed or different aspect ratio items inside a container

## Installation

```bash
npm install @solid-primitives/aspect-grid
# or
yarn add @solid-primitives/aspect-grid
# or
pnpm add @solid-primitives/aspect-grid
```

## How to use it

```ts
type AspectGridProps = {
  fixedRatio: number;
} | {
  getAspect: (node) => number;
};

<div ref={createAspectGrid( fixedRatio: 16/9 )}>
  <For each={images}>{src => <img src={src} alt="" />}</For>
</div>

<div ref={createFixedAspectGrid({ getAspect: (node) => {
  const width = node?.childNode?.videoWidth, height = node?.childNode.videoHeight;
  return height ? width / height : 0;
} })}>
  <For each={stream}>{stream => <span><video props:srcObject={stream} /></span>}</For>
</div>
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
