<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=virtual" alt="Solid Primitives virtual">
</p>

# @solid-primitives/virtual

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/virtual?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/virtual)
[![version](https://img.shields.io/npm/v/@solid-primitives/virtual?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/virtual)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A basic [virtualized list](https://www.patterns.dev/vanilla/virtual-lists/) component for improving performance when rendering very large lists

## Installation

```bash
npm install @solid-primitives/virtual
# or
yarn add @solid-primitives/virtual
# or
pnpm add @solid-primitives/virtual
```

## How to use it

```tsx
<VirtualList
  // the list of items (of course, to for this component to be useful, the list would need to be much bigger than shown here)
  each={[0, 1, 2, 3, 4, 5, 6, 7]}
  // the optional fallback to display if the list of items is empty
  fallback={<div>No items</div>}
  // the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
  overscanCount={5}
  // the height of the root element of the virtualizedList itself
  rootHeight={20}
  // the height of individual rows in the virtualizedList
  rowHeight={10}
  // the class applied to the root element of the virtualizedList
  class={"my-class-name"}
>
  {
    // the flowComponent that will be used to transform the items into rows in the list
    item => <div>{item}</div>
  }
</VirtualList>
```

The tests describe the component's exact behavior and how overscanCount handles the start/end of the list in more detail.
Note that the component only handles vertical lists where the number of items is known and the height of an individual item is fixed.

## Demo

You can see the VirtualList in action in the following sandbox: https://primitives.solidjs.community/playground/virtual

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
