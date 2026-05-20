import { createSignal } from "solid-js";
import { access } from "@solid-primitives/utils";
import type { ListStateOptions, ListStateReturn } from "./types.js";

/**
 * Creates a keyboard navigable single-select list.
 *
 * @param props - Configuration for the list state
 * @param props.items - The items in the list. Should be in the same order as they appear in the DOM.
 * @param props.initialActive - The initially active item. *Default = `undefined`*
 * @param props.orientation - The orientation of the list. *Default = `'vertical'`*
 * @param props.loop - Whether the list should loop. *Default = `true`*
 * @param props.textDirection - The text direction of the list. *Default = `'ltr'`*
 * @param props.handleTab - Whether tab key presses should be handled. *Default = `true`*
 * @param props.vimMode - Whether vim movement key bindings should be used. *Default = `false`*
 * @param props.vimKeys - The vim movement key bindings. *Default = `{ up: 'k', down: 'j', right: 'l', left: 'h' }`*
 * @param props.onActiveChange - Callback fired when the active item changes.
 * @returns Object with `active` accessor, `setActive` setter, and `onKeyDown` event handler
 *
 * @example
 * ```tsx
 * const { active, setActive, onKeyDown } = createListState({
 *   items: () => ["Item 1", "Item 2", "Item 3"],
 *   initialActive: "Item 1",
 *   onActiveChange: (item) => console.log("Active:", item),
 * });
 *
 * <ul onKeyDown={onKeyDown}>
 *   {items().map((item) => (
 *     <li class={{ active: active() === item }}>{item}</li>
 *   ))}
 * </ul>
 * ```
 */
export function createListState<T>(props: ListStateOptions<T>): ListStateReturn<T> {
  const defaultedProps = {
    initialActive: props.initialActive,
    orientation: props.orientation ?? ("vertical" as const),
    loop: props.loop ?? true,
    textDirection: props.textDirection ?? ("ltr" as const),
    handleTab: props.handleTab ?? true,
    vimMode: props.vimMode ?? false,
    vimKeys: props.vimKeys ?? {
      up: "k",
      down: "j",
      right: "l",
      left: "h",
    },
    items: props.items,
    onActiveChange: props.onActiveChange,
  };

  const [active, setActive] = createSignal<T | undefined>(defaultedProps.initialActive as any);

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

  const updateActive = (newActive: T | undefined) => {
    setActive(newActive as any);
    defaultedProps.onActiveChange?.(newActive);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const eventKey = event.key.toLowerCase();
    const _items = access(defaultedProps.items);
    if (_items.length === 0) return;
    const _itemCount = _items.length;
    const _active = active();
    const _activeIndex = _active !== undefined ? _items.indexOf(_active) : undefined;

    if (nextKeys().includes(eventKey)) {
      event.preventDefault();
      if (_activeIndex === _itemCount - 1) {
        if (access(defaultedProps.loop)) {
          updateActive(_items[0]!);
        }
      } else {
        updateActive(_items[_activeIndex !== undefined ? _activeIndex + 1 : 0]!);
      }
    } else if (previousKeys().includes(eventKey)) {
      event.preventDefault();
      if (_activeIndex === 0) {
        if (access(defaultedProps.loop)) {
          updateActive(_items[_itemCount - 1]!);
        }
      } else {
        updateActive(_items[_activeIndex !== undefined ? _activeIndex - 1 : _itemCount - 1]!);
      }
    } else if (eventKey === "home") {
      event.preventDefault();
      updateActive(_items[0]!);
    } else if (eventKey === "end") {
      event.preventDefault();
      updateActive(_items[_itemCount - 1]!);
    } else if (access(defaultedProps.handleTab) && _activeIndex !== undefined) {
      if (eventKey === "tab" && !event.shiftKey && _activeIndex < _itemCount - 1) {
        event.preventDefault();
        updateActive(_items[_activeIndex + 1]!);
      }
      if (eventKey === "tab" && event.shiftKey && _activeIndex > 0) {
        event.preventDefault();
        updateActive(_items[_activeIndex - 1]!);
      }
    }
  };

  return { active, setActive: (value: T | undefined) => updateActive(value), onKeyDown };
}
