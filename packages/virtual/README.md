<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=virtual" alt="Solid Primitives virtual">
</p>

# @solid-primitives/virtual

[![size](https://img.shields.io/badge/size-647_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/virtual)
[![version](https://img.shields.io/npm/v/@solid-primitives/virtual?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/virtual)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

- [`createVirtualList`](#createvirtuallist) - A headless utility function for [virtualized lists](https://www.patterns.dev/vanilla/virtual-lists/)
- [`VirtualList`](#virtuallist) - a basic, unstyled component based on `createVirtualList`

## Installation

```bash
npm install @solid-primitives/virtual
# or
yarn add @solid-primitives/virtual
# or
pnpm add @solid-primitives/virtual
```

## How to use it

### `createVirtualList`

`createVirtualList` is a headless utility for constructing your own virtualized list components with maximum flexibility.

`virtual` is an accessor returning `{ containerHeight, viewerTop, visibleItems, firstIndex, lastIndex }` — call it to read the current values. When rendering `visibleItems` with `<For>`, pass `keyed={false}` so each item is provided as an `Accessor` (`<For>` defaults to `keyed={true}`, which passes raw values instead).

- `firstIndex` is the index (into the original `items` list) of the first rendered item.
- `lastIndex` is the index of the last rendered item, or `undefined` if the list is empty.

Together they're useful for things like "showing items X-Y of Z" counters, since `visibleItems` alone doesn't tell you where those items sit in the original list.

```tsx
function MyComp(): JSX.Element {
  const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rootHeight = 20;
  const rowHeight = 10;
  const overscanCount = 5;

  const [virtual, onScroll] = createVirtualList({
    // the list of items - can be a signal
    items,
    // the height of the root element of the virtualizedList - can be a signal
    rootHeight,
    // the height of individual rows in the virtualizedList - can be a signal
    rowHeight,
    // the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling - can be a signal
    overscanCount,
  });

  return (
    <div
      style={{
        overflow: "auto",
        // root element's height must be rootHeight
        height: `${rootHeight}px`,
      }}
      // outermost container must use onScroll
      onScroll={onScroll}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          // list container element's height must be set to virtual().containerHeight
          height: `${virtual().containerHeight}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            // viewer element's top must be set to virtual().viewerTop
            top: `${virtual().viewerTop}px`,
          }}
        >
          {/* only virtual().visibleItems are ultimately rendered */}
          {/* keyed={false} is required for item to be passed as an Accessor — <For> defaults to keyed={true}, passing raw values instead */}
          <For fallback={"no items"} each={virtual().visibleItems} keyed={false}>
            {item => <div>{item()}</div>}
          </For>
        </div>
      </div>
    </div>
  );
}
```

### `<VirtualList />`

`<VirtualList />` is a basic, unstyled virtual list component you can drop into projects without modification.

```tsx
<VirtualList
  // the list of items (of course, to for this component to be useful, the list would need to be much bigger than shown here)
  each={[0, 1, 2, 3, 4, 5, 6, 7]}
  // the optional fallback to display if the list of items is empty
  fallback={<div>No items</div>}
  // an optional class applied to the element wrapping the rendered rows, useful for styling row layout (e.g. flex/grid)
  class="my-list"
  // the number of elements to render both before and after the visible section of the list, so passing 5 will render 5 items before the list, and 5 items after. Defaults to 1, cannot be set to zero. This is necessary to hide the blank space around list items when scrolling
  overscanCount={5}
  // the height of the root element of the virtualizedList itself
  rootHeight={20}
  // the height of individual rows in the virtualizedList
  rowHeight={10}
>
  {
    // the flowComponent that will be used to transform the items into rows in the list
    // item is an Accessor — call it to get the value
    item => <div>{item()}</div>
  }
</VirtualList>
```

The tests describe the exact behavior and how overscanCount handles the start/end of the list in more detail.
Note that the component only handles vertical lists where the number of items is known and the height of an individual item is fixed.

#### Styling the rows with `class`

The rendered rows are wrapped in an absolutely positioned element that `<VirtualList>` manages internally (for offsetting the visible window as you scroll). Pass `class` to have it applied to that wrapper, which is useful for laying out rows with flexbox or grid instead of relying on each row's own styles:

```tsx
<VirtualList each={items} rootHeight={400} rowHeight={40} class="row-list">
  {item => <div>{item()}</div>}
</VirtualList>
```

```css
.row-list {
  display: flex;
  flex-flow: column;
  width: 100%;
}
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
