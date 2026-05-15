<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=list-state" alt="Solid Primitives list-state">
</p>

# @solid-primitives/list-state

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/list-state?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/list-state)
[![version](https://img.shields.io/npm/v/@solid-primitives/list-state?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/list-state)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for managing keyboard-navigable list state. Provides accessible, fully-featured list state management with support for single-select and multi-select patterns.

- [`createListState`](#createliststate) — Single-select list with keyboard navigation
- [`createMultiSelectListState`](#createmultiselectliststate) — Multi-select list with cursor-based navigation and range selection

## Installation

```bash
npm install @solid-primitives/list-state
# or
yarn add @solid-primitives/list-state
# or
pnpm add @solid-primitives/list-state
```

## Features

- **Full keyboard support**: Arrow keys, Vim bindings (hjkl), Home/End, Tab
- **Configurable orientation**: Vertical or horizontal lists
- **Bidirectional text**: RTL and LTR support
- **List looping**: Optional looping at list boundaries
- **Range selection**: Shift+Arrow for multi-select range expansion
- **Type-safe**: Full TypeScript support with generic item types
- **SSR-safe**: Works in both browser and server environments
- **Zero dependencies**: Relies only on Solid.js primitives

## `createListState`

A reactive primitive for single-select list navigation. Returns an `active` signal for the currently selected item and an `onKeyDown` handler for keyboard events.

```ts
import { createListState } from "@solid-primitives/list-state";
import { createSignal } from "solid-js";

export function MyList() {
  const items = ["Apple", "Banana", "Cherry"];
  const { active, setActive, onKeyDown } = createListState({
    items,
    initialActive: items[0],
  });

  return (
    <ul role="listbox" onKeyDown={onKeyDown}>
      {items.map((item) => (
        <li
          role="option"
          aria-selected={active() === item}
          onClick={() => setActive(item)}
          class={{ selected: active() === item }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### Props

```ts
interface ListStateProps<T> {
  /** The items in the list. Should be in the same order as they appear in the DOM. */
  items: MaybeAccessor<T[]>;
  
  /** The initially active item. @default null */
  initialActive?: T | null;
  
  /** The orientation of the list. @default "vertical" */
  orientation?: MaybeAccessor<"vertical" | "horizontal">;
  
  /** Whether the list should loop. @default true */
  loop?: MaybeAccessor<boolean>;
  
  /** The text direction of the list. @default "ltr" */
  textDirection?: MaybeAccessor<"ltr" | "rtl">;
  
  /** Whether tab key presses should be handled. @default true */
  handleTab?: MaybeAccessor<boolean>;
  
  /** Whether vim movement key bindings should be used. @default false */
  vimMode?: MaybeAccessor<boolean>;
  
  /** The vim movement key bindings. @default { up: 'k', down: 'j', right: 'l', left: 'h' } */
  vimKeys?: MaybeAccessor<{ up: string; down: string; right: string; left: string }>;
  
  /** Callback fired when the active item changes. */
  onActiveChange?: (active: T | null) => void;
}
```

### Returns

```ts
interface ListStateReturn<T> {
  active: Accessor<T | null>;
  setActive: (value: T | null) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| <kbd>↑</kbd> / <kbd>↓</kbd> | Navigate vertically (or ← / → for horizontal) |
| <kbd>Home</kbd> | Jump to first item |
| <kbd>End</kbd> | Jump to last item |
| <kbd>Tab</kbd> | Navigate forward (if `handleTab` is true) |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> | Navigate backward (if `handleTab` is true) |
| <kbd>k</kbd> / <kbd>j</kbd> | Vim navigation (if `vimMode` is true) |

## `createMultiSelectListState`

A reactive primitive for multi-select list navigation with range selection. Maintains three separate states: `cursor` (focused item), `active` (range of focused items), and `selected` (user-selected items).

```ts
import { createMultiSelectListState } from "@solid-primitives/list-state";

export function MyMultiSelectList() {
  const items = ["Apple", "Banana", "Cherry"];
  const { cursor, active, selected, setCursorActive, toggleSelected, onKeyDown } =
    createMultiSelectListState({
      items,
    });

  return (
    <ul role="listbox" onKeyDown={onKeyDown}>
      {items.map((item) => (
        <li
          role="option"
          aria-selected={selected().includes(item)}
          onClick={() => setCursorActive(item)}
          onDoubleClick={() => toggleSelected(item)}
          class={{
            cursor: cursor() === item,
            selected: selected().includes(item),
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### Props

```ts
interface MultiSelectListStateProps<T> {
  // Same as ListStateProps<T>, plus:
  
  /** The initially focused item (cursor). @default null */
  initialCursor?: T | null;
  
  /** The initially active items (range). @default [] */
  initialActive?: T[];
  
  /** The initially selected items. @default [] */
  initialSelected?: T[];
  
  /** Callback fired when the cursor changes. */
  onCursorChange?: (cursor: T | null) => void;
  
  /** Callback fired when the active items change. */
  onActiveChange?: (active: T[]) => void;
  
  /** Callback fired when the selected items change. */
  onSelectedChange?: (selected: T[]) => void;
}
```

### Returns

```ts
interface MultiSelectListStateReturn<T> {
  cursor: Accessor<T | null>;
  setCursor: (value: T | null) => void;
  active: Accessor<T[]>;
  setActive: (value: T[]) => void;
  setCursorActive: (item: T | null) => void;
  selected: Accessor<T[]>;
  setSelected: (value: T[]) => void;
  toggleSelected: (item: T) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}
```

### Keyboard Shortcuts

All shortcuts from `createListState` plus:

| Key | Action |
|-----|--------|
| <kbd>Shift</kbd>+<kbd>↑</kbd> / <kbd>↓</kbd> | Expand/contract selection range |

## Types

```ts
export type Orientation = "vertical" | "horizontal";
export type TextDirection = "ltr" | "rtl";

export type VimKeys = {
  up: string;
  down: string;
  right: string;
  left: string;
};
```

## Server-Side Rendering

Both primitives are fully SSR-safe and will work correctly in both browser and server environments.

## Credits

This primitive was adapted from [corvu's solid-list](https://github.com/corvudev/corvu/tree/main/packages/solid-list) by [Jasmin Noetzli](https://github.com/GiyoMoon) and migrated to Solid Primitives for Solid 2.0. Used under the MIT License.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
