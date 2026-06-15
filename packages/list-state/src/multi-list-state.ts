import { createSignal } from "solid-js";
import { access } from "@solid-primitives/utils";
import type { MultiSelectListStateOptions, MultiSelectListStateReturn } from "./types.js";

/**
 * Creates a keyboard navigable multi-select list with cursor-based navigation.
 *
 * @param options - Configuration for the multi-select list state
 * @param options.items - The items in the list. Should be in the same order as they appear in the DOM.
 * @param options.initialCursor - The initially focused item (cursor). *Default = `undefined`*
 * @param options.initialActive - The initially active items. *Default = `[]`*
 * @param options.initialSelected - The initially selected items. *Default = `[]`*
 * @param options.orientation - The orientation of the list. *Default = `'vertical'`*
 * @param options.loop - Whether the list should loop. *Default = `true`*
 * @param options.textDirection - The text direction of the list. *Default = `'ltr'`*
 * @param options.handleTab - Whether tab key presses should be handled. *Default = `true`*
 * @param options.vimMode - Whether vim movement key bindings should be used. *Default = `false`*
 * @param options.vimKeys - The vim movement key bindings. *Default = `{ up: 'k', down: 'j', right: 'l', left: 'h' }`*
 * @param options.onCursorChange - Callback fired when the cursor changes.
 * @param options.onActiveChange - Callback fired when the active items change.
 * @param options.onSelectedChange - Callback fired when the selected items change.
 * @returns Object with cursor, active, and selected accessors/setters, plus utility methods
 *
 * @example
 * ```tsx
 * const { cursor, active, selected, setCursorActive, toggleSelected, onKeyDown } = createMultiSelectListState({
 *   items: () => ["Item 1", "Item 2", "Item 3"],
 *   initialCursor: "Item 1",
 * });
 *
 * <ul onKeyDown={onKeyDown}>
 *   <For each={items()}>
 *     {(item) => (
 *       <li
 *         class={{ cursor: cursor() === item, selected: selected().includes(item) }}
 *         onClick={() => setCursorActive(item)}
 *       >
 *         {item}
 *       </li>
 *     )}
 *   </For>
 * </ul>
 * ```
 */
export function createMultiSelectListState<T>(
  options: MultiSelectListStateOptions<T>,
): MultiSelectListStateReturn<T> {
  const defaultedProps = {
    initialCursor: options.initialCursor,
    initialActive: options.initialActive ?? [],
    initialSelected: options.initialSelected ?? [],
    orientation: options.orientation ?? "vertical",
    loop: options.loop ?? true,
    textDirection: options.textDirection ?? "ltr",
    handleTab: options.handleTab ?? true,
    vimMode: options.vimMode ?? false,
    vimKeys: options.vimKeys ?? {
      up: "k",
      down: "j",
      right: "l",
      left: "h",
    },
    items: options.items,
    onCursorChange: options.onCursorChange,
    onActiveChange: options.onActiveChange,
    onSelectedChange: options.onSelectedChange,
  };

  const [cursor, setCursor] = createSignal<T | undefined>(defaultedProps.initialCursor as never);
  const [active, setActive] = createSignal<T[]>(defaultedProps.initialActive);
  const [selected, setSelected] = createSignal<T[]>(defaultedProps.initialSelected);

  let direction: "next" | "previous" | null = null;

  const updateCursor = (newCursor: T | undefined) => {
    newCursor === undefined ? setCursor() : setCursor(() => newCursor);
    defaultedProps.onCursorChange?.(newCursor);
  };

  const updateActive = (newActive: T[]) => {
    setActive(newActive);
    defaultedProps.onActiveChange?.(newActive);
  };

  const updateSelected = (newSelected: T[]) => {
    setSelected(newSelected);
    defaultedProps.onSelectedChange?.(newSelected);
  };

  const setCursorActive = (item: T | undefined) => {
    updateCursor(item);
    updateActive(item !== undefined ? [item] : []);
    direction = null;
  };

  const toggleSelected = (item: T) => {
    const currentSelected = selected();
    updateSelected(
      currentSelected.includes(item) ? currentSelected.filter((s) => s !== item) : [...currentSelected, item],
    );
  };

  const nextKeys = () => {
    const vimKeys = access(defaultedProps.vimKeys);
    let arrowKey: string;
    let vimKey: string;
    if (access(defaultedProps.orientation) === "vertical") {
      arrowKey = "arrowdown";
      vimKey = vimKeys.down;
    } else if (access(defaultedProps.textDirection) === "ltr") {
      arrowKey = "arrowright";
      vimKey = vimKeys.right;
    } else {
      arrowKey = "arrowleft";
      vimKey = vimKeys.left;
    }
    return access(defaultedProps.vimMode) ? [arrowKey, vimKey] : [arrowKey];
  };

  const previousKeys = () => {
    const vimKeys = access(defaultedProps.vimKeys);
    let arrowKey: string;
    let vimKey: string;
    if (access(defaultedProps.orientation) === "vertical") {
      arrowKey = "arrowup";
      vimKey = vimKeys.up;
    } else if (access(defaultedProps.textDirection) === "ltr") {
      arrowKey = "arrowleft";
      vimKey = vimKeys.left;
    } else {
      arrowKey = "arrowright";
      vimKey = vimKeys.right;
    }
    return access(defaultedProps.vimMode) ? [arrowKey, vimKey] : [arrowKey];
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const eventKey = event.key.toLowerCase();
    const _items = access(defaultedProps.items);
    if (_items.length === 0) return;
    const _itemCount = _items.length;
    const _cursor = cursor();
    const _cursorIndex = _cursor !== undefined ? _items.indexOf(_cursor) : undefined;
    const _active = active();

    if (nextKeys().includes(eventKey)) {
      event.preventDefault();
      if (event.shiftKey) {
        if (_cursorIndex === undefined) {
          setCursorActive(_items[0]);
          updateSelected([_items[0]!]);
        } else if (
          _cursorIndex !== _itemCount - 1 ||
          (_active.length === 1 && direction === "previous")
        ) {
          if (_active.length === 1 && direction !== "next") {
            toggleSelected(_cursor!);
            direction = direction === "previous" ? null : "next";
          } else {
            const newCursor = _items[_cursorIndex + 1]!;
            updateCursor(newCursor);
            if (_active.includes(newCursor)) {
              updateActive(_active.filter((a) => a !== _cursor));
              toggleSelected(_cursor!);
            } else {
              updateActive([..._active, newCursor]);
              toggleSelected(newCursor);
            }
          }
        }
      } else {
        if (_cursorIndex === _itemCount - 1) {
          if (access(defaultedProps.loop)) {
            setCursorActive(_items[0]);
          }
        } else {
          setCursorActive(_items[_cursorIndex !== undefined ? _cursorIndex + 1 : 0]);
        }
      }
    } else if (previousKeys().includes(eventKey)) {
      event.preventDefault();
      if (event.shiftKey) {
        if (_cursorIndex === undefined) {
          setCursorActive(_items[_itemCount - 1]);
          updateSelected([_items[_itemCount - 1]!]);
        } else if (
          _cursorIndex !== 0 ||
          (_active.length === 1 && direction === "next")
        ) {
          if (_active.length === 1 && direction !== "previous") {
            toggleSelected(_cursor!);
            direction = direction === "next" ? null : "previous";
          } else {
            const newCursor = _items[_cursorIndex - 1]!;
            updateCursor(newCursor);
            if (_active.includes(newCursor)) {
              updateActive(_active.filter((a) => a !== _cursor));
              toggleSelected(_cursor!);
            } else {
              updateActive([..._active, newCursor]);
              toggleSelected(newCursor);
            }
          }
        }
      } else {
        if (_cursorIndex === 0) {
          if (access(defaultedProps.loop)) {
            setCursorActive(_items[_itemCount - 1]);
          }
        } else {
          setCursorActive(
            _items[_cursorIndex !== undefined ? _cursorIndex - 1 : _itemCount - 1],
          );
        }
      }
    } else if (eventKey === "home") {
      event.preventDefault();
      setCursorActive(_items[0]);
    } else if (eventKey === "end") {
      event.preventDefault();
      setCursorActive(_items[_itemCount - 1]);
    } else if (access(defaultedProps.handleTab) && _cursorIndex !== undefined) {
      if (eventKey === "tab" && !event.shiftKey && _cursorIndex < _itemCount - 1) {
        event.preventDefault();
        setCursorActive(_items[_cursorIndex + 1]);
      }
      if (eventKey === "tab" && event.shiftKey && _cursorIndex > 0) {
        event.preventDefault();
        setCursorActive(_items[_cursorIndex - 1]);
      }
    }
  };

  return {
    cursor,
    setCursor: (value: T | undefined) => updateCursor(value),
    active,
    setActive: (value: T[]) => updateActive(value),
    setCursorActive,
    selected,
    setSelected: (value: T[]) => updateSelected(value),
    toggleSelected,
    onKeyDown,
  };
}
