import { createEffect, createSignal, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import {
  access,
  INTERNAL_OPTIONS,
  tryOnCleanup,
  type MaybeAccessor,
} from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";
import { FOCUSABLE_ELEMENT_SELECTOR, isElementVisible } from "./tabbable.ts";
import { isTextEntry } from "./textEntry.ts";

export type RovingOrientation = "horizontal" | "vertical" | "both";
export type RovingDirection = "ltr" | "rtl";

export interface RovingScopeOptions {
  /** CSS selector matching the items of the scope. @default all focusable elements */
  selector?: string;
  /** Arrow keys that move between items. `"both"` accepts all four arrows. @default "both" */
  orientation?: RovingOrientation;
  /** Wrap around at the ends. @default false */
  loop?: boolean;
  /** Text direction. Detected from the closest `[dir]` / computed style when omitted. */
  textDirection?: RovingDirection;
  /**
   * Skip items with `aria-disabled="true"` while navigating. Natively `disabled` and hidden
   * items are always skipped, as they cannot take focus. @default true
   */
  skipDisabled?: boolean;
  /** Pick the item that is tabbable initially (and after the active one disappears). Defaults to the first navigable item. */
  initialActive?: (items: HTMLElement[]) => HTMLElement | undefined;
  /** Called whenever the active (tabbable) item changes. */
  onActiveChange?: (item: HTMLElement | undefined) => void;
  /** Whether the arrow/Home/End keyboard handling is attached. @default true */
  keyboardNavigation?: boolean;
}

export interface RovingScope {
  /** The item that currently has `tabindex="0"`. */
  active(): HTMLElement | undefined;
  /** The items owned by this scope (nested scopes' items excluded), in DOM order. */
  items(): HTMLElement[];
  /** Makes `item` the tabbable item, optionally moving focus to it. Returns whether it was accepted. */
  setActive(item: HTMLElement, focus?: boolean): boolean;
  /** Moves focus to the active (remembered) item. */
  focus(): HTMLElement | undefined;
  focusNext(): HTMLElement | undefined;
  focusPrevious(): HTMLElement | undefined;
  focusFirst(): HTMLElement | undefined;
  focusLast(): HTMLElement | undefined;
  /** Re-scans the container. Called automatically when the DOM changes. */
  refresh(): void;
  /** Detaches listeners and restores the original `tabindex` values. */
  dispose: VoidFunction;
}

// ---- shared registry (nested scopes + original tabindex bookkeeping) ----

interface Registered {
  container: HTMLElement;
  refresh: VoidFunction;
}
const registry = new Set<Registered>();
const scopeContainers = new WeakSet<Element>();
const originalTabIndex = new WeakMap<Element, string | null>();

function ownerContainer(el: Element): Element | undefined {
  let p = el.parentElement;
  while (p) {
    if (scopeContainers.has(p)) return p;
    p = p.parentElement;
  }
}

function notifyAncestors(container: HTMLElement, self?: Registered): void {
  for (const other of [...registry]) {
    if (other !== self && other.container !== container && other.container.contains(container)) {
      other.refresh();
    }
  }
}

function detectDirection(container: HTMLElement): RovingDirection {
  const attr = container.closest("[dir]")?.getAttribute("dir");
  if (attr === "rtl" || attr === "ltr") return attr;
  try {
    return getComputedStyle(container).direction === "rtl" ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}

const isNativelyDisabled = (el: HTMLElement): boolean => {
  try {
    return el.matches(":disabled");
  } catch {
    return el.hasAttribute("disabled");
  }
};

const noopScope: RovingScope = {
  active: () => undefined,
  items: () => [],
  setActive: () => false,
  focus: () => undefined,
  focusNext: () => undefined,
  focusPrevious: () => undefined,
  focusFirst: () => undefined,
  focusLast: () => undefined,
  refresh: () => {},
  dispose: () => {},
};

/**
 * Manages a roving tabindex for the items of `container` matching `options.selector`: only the
 * active item has `tabindex="0"`, the others `-1`. Arrow keys / Home / End move between items
 * (respecting orientation, direction, loop and disabled items), the last active item is
 * remembered when focus leaves, items added or removed later are picked up through a
 * `MutationObserver`, and nested scopes are managed independently.
 *
 * Unlike `createFocusGroup`, which only moves focus around and leaves tab order alone, this
 * makes the whole container a single tab stop.
 *
 * @returns The scope API. Call `scope.dispose()` to tear it down (also done automatically on owner cleanup).
 *
 * @example
 * ```ts
 * const scope = makeRovingScope(toolbarEl, { selector: "button", orientation: "horizontal" });
 * scope.focusFirst();
 * ```
 */
export function makeRovingScope(
  container: HTMLElement,
  options: RovingScopeOptions = {},
): RovingScope {
  if (isServer) return noopScope;

  const selector = options.selector ?? FOCUSABLE_ELEMENT_SELECTOR;
  // read lazily (at event time) so a live options object can change them without a rebuild
  const skipDisabled = (): boolean => options.skipDisabled ?? true;
  let active: HTMLElement | undefined;
  let lastIndex = 0;
  let known = new Set<HTMLElement>();
  let disposed = false;

  const collect = (): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
      el => ownerContainer(el) === container,
    );

  const isNavigable = (el: HTMLElement): boolean =>
    el.isConnected &&
    !isNativelyDisabled(el) &&
    !(skipDisabled() && el.getAttribute("aria-disabled") === "true") &&
    isElementVisible(el);

  const syncTabIndex = (): void => {
    for (const el of known) {
      const want = el === active ? "0" : "-1";
      if (el.getAttribute("tabindex") !== want) el.setAttribute("tabindex", want);
    }
  };

  const setActiveInternal = (item: HTMLElement | undefined): void => {
    const changed = item !== active;
    active = item;
    syncTabIndex();
    if (changed) options.onActiveChange?.(item);
  };

  const refresh = (): void => {
    if (disposed) return;
    const items = collect();
    known = new Set(items);
    for (const el of items) {
      if (!originalTabIndex.has(el)) originalTabIndex.set(el, el.getAttribute("tabindex"));
    }

    if (active && known.has(active) && isNavigable(active)) {
      lastIndex = items.indexOf(active);
      syncTabIndex();
      return;
    }

    let pick: HTMLElement | undefined;
    if (active) {
      // the active item went away or became unavailable: take the closest navigable neighbour
      pick =
        items.slice(lastIndex).find(isNavigable) ??
        items.slice(0, lastIndex).reverse().find(isNavigable);
    } else {
      const navigable = items.filter(isNavigable);
      const initial = options.initialActive?.(navigable);
      pick = initial && navigable.includes(initial) ? initial : navigable[0];
    }
    if (pick) lastIndex = items.indexOf(pick);
    setActiveInternal(pick);
  };

  const itemOf = (target: EventTarget | null): HTMLElement | undefined => {
    if (!(target instanceof Element)) return;
    let el: Element | null = target;
    while (el && el !== container) {
      if (el instanceof HTMLElement && known.has(el)) return el;
      el = el.parentElement;
    }
  };

  const focusItem = (item: HTMLElement | undefined): HTMLElement | undefined => {
    if (!item) return;
    setActiveInternal(item);
    lastIndex = [...known].indexOf(item);
    item.focus();
    return item;
  };

  const step = (dir: 1 | -1, from: HTMLElement | undefined): HTMLElement | undefined => {
    const items = collect().filter(el => isNavigable(el) || el === from);
    if (!items.length) return;
    const index = from ? items.indexOf(from) : -1;
    let nextIndex = index + dir;
    if (index === -1) nextIndex = dir === 1 ? 0 : items.length - 1;
    if (nextIndex < 0 || nextIndex >= items.length) {
      if (!(options.loop ?? false)) return from;
      nextIndex = (nextIndex + items.length) % items.length;
    }
    const target = items[nextIndex]!;
    return target === from ? from : focusItem(target);
  };

  const current = (): HTMLElement | undefined => {
    const focused = itemOf(container.ownerDocument.activeElement);
    return focused ?? active;
  };

  const first = () => focusItem(collect().find(isNavigable));
  const last = () => focusItem(collect().filter(isNavigable).at(-1));

  const direction = (): RovingDirection => options.textDirection ?? detectDirection(container);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }
    const item = itemOf(event.target);
    if (!item) return;
    const rtl = direction() === "rtl";
    const orientation = options.orientation ?? "both";
    const horizontal = orientation !== "vertical";
    const vertical = orientation !== "horizontal";
    let result: "next" | "prev" | "first" | "last" | undefined;
    switch (event.key) {
      case "ArrowRight":
        if (horizontal) result = rtl ? "prev" : "next";
        break;
      case "ArrowLeft":
        if (horizontal) result = rtl ? "next" : "prev";
        break;
      case "ArrowDown":
        if (vertical) result = "next";
        break;
      case "ArrowUp":
        if (vertical) result = "prev";
        break;
      case "Home":
        result = "first";
        break;
      case "End":
        result = "last";
        break;
    }
    if (!result) return;
    // inside text fields these keys move the caret
    if (isTextEntry(event.target)) return;
    event.preventDefault();
    if (result === "next") step(1, item);
    else if (result === "prev") step(-1, item);
    else if (result === "first") first();
    else last();
  };

  const handleFocusIn = (event: FocusEvent): void => {
    const item = itemOf(event.target);
    if (item && isNavigable(item)) {
      setActiveInternal(item);
      lastIndex = [...known].indexOf(item);
    }
  };

  const self: Registered = { container, refresh };
  scopeContainers.add(container);
  registry.add(self);

  refresh();
  notifyAncestors(container, self);

  const clears: VoidFunction[] = [makeEventListener(container, "focusin", handleFocusIn)];
  clears.push(
    makeEventListener(container, "keydown", e => {
      if (options.keyboardNavigation ?? true) handleKeyDown(e);
    }),
  );

  const observer = new MutationObserver(refresh);
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "aria-disabled", "hidden", "inert", "style", "class"],
  });

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    clears.forEach(clear => clear());
    for (const el of known) {
      if (originalTabIndex.has(el)) {
        const original = originalTabIndex.get(el)!;
        if (original === null) el.removeAttribute("tabindex");
        else el.setAttribute("tabindex", original);
        originalTabIndex.delete(el);
      }
    }
    known.clear();
    registry.delete(self);
    scopeContainers.delete(container);
    active = undefined;
    notifyAncestors(container);
  };

  tryOnCleanup(dispose);

  return {
    active: () => active,
    items: () => collect(),
    setActive(item, focus = false) {
      if (!known.has(item) || !isNavigable(item)) return false;
      if (focus) focusItem(item);
      else {
        setActiveInternal(item);
        lastIndex = [...known].indexOf(item);
      }
      return true;
    },
    focus: () => focusItem(current()),
    focusNext: () => step(1, current()),
    focusPrevious: () => step(-1, current()),
    focusFirst: first,
    focusLast: last,
    refresh,
    dispose,
  };
}

export interface CreateRovingScopeOptions {
  selector?: MaybeAccessor<string | undefined>;
  orientation?: MaybeAccessor<RovingOrientation | undefined>;
  loop?: MaybeAccessor<boolean | undefined>;
  textDirection?: MaybeAccessor<RovingDirection | undefined>;
  skipDisabled?: MaybeAccessor<boolean | undefined>;
  keyboardNavigation?: MaybeAccessor<boolean | undefined>;
  /** Set to `false` to deactivate the scope (items are restored to their original tabindex). */
  enabled?: MaybeAccessor<boolean | undefined>;
  initialActive?: (items: HTMLElement[]) => HTMLElement | undefined;
}

export interface RovingScopeSignal extends Omit<RovingScope, "dispose"> {
  /** Reactive version of `active()`. */
  active: Accessor<HTMLElement | undefined>;
}

/**
 * Reactive version of {@link makeRovingScope}: follows the `container` accessor and the
 * (optionally reactive) options, and cleans up with the owner. `scope.active` is a signal.
 *
 * @example
 * ```tsx
 * const [ref, setRef] = createSignal<HTMLElement>();
 * const scope = createRovingScope(ref, { selector: "button", orientation: "horizontal" });
 *
 * <div role="toolbar" ref={setRef}>...</div>
 * ```
 */
export function createRovingScope(
  container: Accessor<HTMLElement | null | undefined>,
  options: CreateRovingScopeOptions = {},
): RovingScopeSignal {
  const [active, setActive] = createSignal<HTMLElement | undefined>(undefined, INTERNAL_OPTIONS);
  let instance: RovingScope | undefined;

  if (!isServer) {
    createEffect(
      () => ({
        el: container(),
        enabled: access(options.enabled) ?? true,
        selector: access(options.selector),
      }),
      ({ el, enabled, selector }) => {
        if (!el || !enabled) {
          instance = undefined;
          setActive(undefined);
          return;
        }
        const scope = makeRovingScope(el, {
          selector,
          // non-structural options are read lazily so changing them keeps the active item
          get orientation() {
            return access(options.orientation);
          },
          get loop() {
            return access(options.loop);
          },
          get textDirection() {
            return access(options.textDirection);
          },
          get skipDisabled() {
            return access(options.skipDisabled);
          },
          get keyboardNavigation() {
            return access(options.keyboardNavigation);
          },
          initialActive: options.initialActive,
          onActiveChange: setActive,
        });
        instance = scope;
        setActive(scope.active());
        return () => {
          scope.dispose();
          if (instance === scope) instance = undefined;
        };
      },
    );
  }

  // skipDisabled changes which items are navigable: re-scan without rebuilding the scope
  createEffect(
    () => access(options.skipDisabled),
    () => {
      instance?.refresh();
    },
    { defer: true },
  );

  return {
    active,
    items: () => instance?.items() ?? [],
    setActive: (item, focus) => instance?.setActive(item, focus) ?? false,
    focus: () => instance?.focus(),
    focusNext: () => instance?.focusNext(),
    focusPrevious: () => instance?.focusPrevious(),
    focusFirst: () => instance?.focusFirst(),
    focusLast: () => instance?.focusLast(),
    refresh: () => instance?.refresh(),
  };
}
