<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=virtualized-list" alt="Solid Primitives virtualized-list">
</p>

# @solid-primitives/virtualized-list

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/virtualized-list?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/virtualized-list)
[![version](https://img.shields.io/npm/v/@solid-primitives/virtualized-list?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/virtualized-list)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A basic [virtualized list](https://www.patterns.dev/vanilla/virtual-lists/) component for improving performance when rendering very large lists

## Installation

```bash
npm install @solid-primitives/virtualized-list
# or
yarn add @solid-primitives/virtualized-list
# or
pnpm add @solid-primitives/virtualized-list
```

## How to use it

```tsx
<VirtualList
  // the list of items (of course, to for this component to be useful, the list would need to be much bigger than shown here)
  items={[0, 1, 2, 3, 4, 5, 6, 7]}
  // the component function that will be used to transform the items into rows in the table
  renderRow={item => <VirtualListItem item={item} />}
  // the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
  overscanCount={5}
  // the height of the root element of the virtualizedList itself
  rootHeight={20}
  // the height of individual rows in the virtualizedList
  rowHeight={10}
  // the class applied to the root element of the virtualizedList
  class={"my-class-name"}
/>
```

The tests describe the component's exact behavior and how overscanCount handles the start/end of the list in more detail.

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
