import type { Accessor } from "solid-js";
import type { MaybeAccessor } from "@solid-primitives/utils";

export type VimKeys = {
  up: string;
  down: string;
  right: string;
  left: string;
};

export type Orientation = "vertical" | "horizontal";
export type TextDirection = "ltr" | "rtl";

export interface ListStateOptions<T> {
  /** The items in the list. Should be in the same order as they appear in the DOM. */
  items: MaybeAccessor<T[]>;
  /** The initially active item. @default undefined */
  initialActive?: T;
  /** The orientation of the list. @default "vertical" */
  orientation?: MaybeAccessor<Orientation>;
  /** Whether the list should loop. @default true */
  loop?: MaybeAccessor<boolean>;
  /** The text direction of the list. @default "ltr" */
  textDirection?: MaybeAccessor<TextDirection>;
  /** Whether tab key presses should be handled. @default true */
  handleTab?: MaybeAccessor<boolean>;
  /** Whether vim movement key bindings should be used additionally to arrow key navigation. @default false */
  vimMode?: MaybeAccessor<boolean>;
  /** The vim movement key bindings to use. @default { up: 'k', down: 'j', right: 'l', left: 'h' } */
  vimKeys?: MaybeAccessor<VimKeys>;
  /** Callback fired when the active item changes. */
  onActiveChange?: (active: T | undefined) => void;
}

export interface ListStateReturn<T> {
  active: Accessor<T | undefined>;
  setActive: (value: T | undefined) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

export interface MultiSelectListStateOptions<T> {
  /** The items in the list. Should be in the same order as they appear in the DOM. */
  items: MaybeAccessor<T[]>;
  /** The initially focused item (cursor). @default undefined */
  initialCursor?: T;
  /** The initially active items. @default [] */
  initialActive?: T[];
  /** The initially selected items. @default [] */
  initialSelected?: T[];
  /** The orientation of the list. @default "vertical" */
  orientation?: MaybeAccessor<Orientation>;
  /** Whether the list should loop. @default true */
  loop?: MaybeAccessor<boolean>;
  /** The text direction of the list. @default "ltr" */
  textDirection?: MaybeAccessor<TextDirection>;
  /** Whether tab key presses should be handled. @default true */
  handleTab?: MaybeAccessor<boolean>;
  /** Whether vim movement key bindings should be used additionally to arrow key navigation. @default false */
  vimMode?: MaybeAccessor<boolean>;
  /** The vim movement key bindings to use. @default { up: 'k', down: 'j', right: 'l', left: 'h' } */
  vimKeys?: MaybeAccessor<VimKeys>;
  /** Callback fired when the cursor changes. */
  onCursorChange?: (cursor: T | undefined) => void;
  /** Callback fired when the active items change. */
  onActiveChange?: (active: T[]) => void;
  /** Callback fired when the selected items change. */
  onSelectedChange?: (selected: T[]) => void;
}

export interface MultiSelectListStateReturn<T> {
  cursor: Accessor<T | undefined>;
  setCursor: (value: T | undefined) => void;
  active: Accessor<T[]>;
  setActive: (value: T[]) => void;
  setCursorActive: (item: T | undefined) => void;
  selected: Accessor<T[]>;
  setSelected: (value: T[]) => void;
  toggleSelected: (item: T) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}
