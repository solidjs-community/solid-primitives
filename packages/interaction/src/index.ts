/*
 * Portions of this file are based on code from kobalte.
 * MIT Licensed, Copyright (c) 2022 Kobalte contributors.
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-interact-outside/create-interact-outside.ts
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-hide-outside/create-hide-outside.ts
 *
 * Which itself is based on code from radix-ui-primitives.
 * MIT Licensed, Copyright (c) 2022 WorkOS.
 *
 * Credits to the Radix UI team:
 * https://github.com/radix-ui/primitives/blob/81b25f4b40c54f72aeb106ca0e64e1e09655153e/packages/react/dismissable-layer/src/DismissableLayer.tsx
 *
 * And from zag.
 * MIT Licensed, Copyright (c) 2021 Chakra UI.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/zag/blob/d1dbf9e240803c9e3ed81ebef363739be4273de0/packages/utilities/interact-outside/src/index.ts
 *
 */

import { type Accessor, createEffect, onCleanup } from "solid-js";
import { type MaybeAccessor, access, isServer, noop } from "@solid-primitives/utils";

// ---- ariaHideOutside / createHideOutside ----

/**
 * Options for {@link createHideOutside}.
 */
export interface CreateHideOutsideOptions {
  /** The elements that should remain visible. */
  targets: MaybeAccessor<Array<Element>>;
  /** Nothing will be hidden above this element. Defaults to `document.body`. */
  root?: MaybeAccessor<HTMLElement | undefined>;
  /** Whether the hide-outside behavior is disabled. */
  disabled?: MaybeAccessor<boolean | undefined>;
  /**
   * A CSS selector string for elements that should always stay visible regardless of
   * target containment (e.g. top-layer elements, live announcers). Optional.
   */
  alwaysVisibleSelector?: string;
}

// Keeps a ref count of all hidden elements so nested usages don't fight.
const refCountMap = new WeakMap<Element, number>();
const observerStack: Array<{ observe(): void; disconnect(): void }> = [];

/**
 * Hides all elements in the DOM outside the given `targets` from screen readers by setting
 * `aria-hidden="true"` on them, and returns a cleanup function that reverts every change.
 *
 * A `MutationObserver` watches for newly inserted nodes and hides them automatically.
 * Calls are ref-counted, so nested invocations cooperate correctly — tearing down an inner
 * call never reveals content that an outer call is still hiding.
 *
 * This is a non-reactive, imperative primitive. For a reactive version that integrates with
 * Solid's ownership model use {@link createHideOutside}.
 *
 * @param targets - Elements that should remain visible (along with their ancestors and descendants).
 * @param root - Root element to walk. Defaults to `document.body`.
 * @param alwaysVisibleSelector - Optional CSS selector for elements that must never be hidden
 *   (e.g. `"[aria-live]"` for live-region announcers or top-layer elements).
 * @returns A cleanup function that removes all `aria-hidden` attributes added by this call.
 *
 * @example
 * ```ts
 * const cleanup = ariaHideOutside([dialogEl]);
 *
 * // When the dialog closes:
 * cleanup();
 * ```
 *
 * @example
 * ```ts
 * // Exempt live-region announcers from being hidden:
 * const cleanup = ariaHideOutside([dialogEl], document.body, "[aria-live]");
 * ```
 */
export function ariaHideOutside(
  targets: Element[],
  root = document.body,
  alwaysVisibleSelector?: string,
): () => void {
  const visibleNodes = new Set<Element>(targets);
  const hiddenNodes = new Set<Element>();

  const walk = (root: Element) => {
    if (alwaysVisibleSelector) {
      Array.from(root.querySelectorAll(alwaysVisibleSelector)).forEach(el => visibleNodes.add(el));
    }

    const acceptNode = (node: Element) => {
      if (
        visibleNodes.has(node) ||
        (node.parentElement &&
          hiddenNodes.has(node.parentElement) &&
          node.parentElement.getAttribute("role") !== "row")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      for (const target of visibleNodes) {
        if (node.contains(target)) return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    };

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, { acceptNode });
    const acceptRoot = acceptNode(root);
    if (acceptRoot === NodeFilter.FILTER_ACCEPT) hide(root);
    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = walker.nextNode() as Element | null;
      while (node != null) {
        hide(node);
        node = walker.nextNode() as Element | null;
      }
    }
  };

  const hide = (node: Element) => {
    const refCount = refCountMap.get(node) ?? 0;
    if (node.getAttribute("aria-hidden") === "true" && refCount === 0) return;
    if (refCount === 0) node.setAttribute("aria-hidden", "true");
    hiddenNodes.add(node);
    refCountMap.set(node, refCount + 1);
  };

  observerStack[observerStack.length - 1]?.disconnect();

  walk(root);

  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type !== "childList" || change.addedNodes.length === 0) continue;
      if (![...visibleNodes, ...hiddenNodes].some((node) => node.contains(change.target))) {
        Array.from(change.removedNodes).forEach(node => {
          if (node instanceof Element) {
            visibleNodes.delete(node);
            hiddenNodes.delete(node);
          }
        });
        Array.from(change.addedNodes).forEach(node => {
          if (node instanceof Element) walk(node);
        });
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  const wrapper = {
    observe() { observer.observe(root, { childList: true, subtree: true }); },
    disconnect() { observer.disconnect(); },
  };
  observerStack.push(wrapper);

  return () => {
    observer.disconnect();
    hiddenNodes.forEach(node => {
      const count = refCountMap.get(node);
      if (count == null) return;
      if (count === 1) {
        node.removeAttribute("aria-hidden");
        refCountMap.delete(node);
      } else {
        refCountMap.set(node, count - 1);
      }
    });
    if (wrapper === observerStack[observerStack.length - 1]) {
      observerStack.pop();
      observerStack[observerStack.length - 1]?.observe();
    } else {
      observerStack.splice(observerStack.indexOf(wrapper), 1);
    }
  };
}

/**
 * Reactively hides all elements outside `options.targets` from screen readers using
 * `aria-hidden`. Re-runs whenever `targets`, `root`, or `disabled` changes, and cleans up
 * automatically when the reactive owner is disposed.
 *
 * For a non-reactive, imperative version use {@link ariaHideOutside}.
 *
 * @param options - Configuration. See {@link CreateHideOutsideOptions}.
 *
 * @example
 * ```tsx
 * function Dialog(props: { open: boolean }) {
 *   const [ref, setRef] = createSignal<HTMLDivElement>();
 *
 *   createHideOutside({
 *     targets: () => (ref() ? [ref()!] : []),
 *     disabled: () => !props.open,
 *   });
 *
 *   return (
 *     <Show when={props.open}>
 *       <div ref={setRef} role="dialog" aria-modal="true">
 *         Dialog content
 *       </div>
 *     </Show>
 *   );
 * }
 * ```
 */
export function createHideOutside(options: CreateHideOutsideOptions): void {
  createEffect(
    () => ({
      disabled: !!access(options.disabled),
      targets: access(options.targets),
      root: access(options.root),
    }),
    ({ disabled, targets, root }) => {
      if (disabled) return;
      return ariaHideOutside(targets, root, options.alwaysVisibleSelector);
    },
  );
}

/** Detail payload carried by every outside-interaction `CustomEvent`. */
export type EventDetails<T> = {
  /** The original DOM event that triggered the outside interaction. */
  originalEvent: T;
  /** `true` when the interaction was a right-click or Ctrl+click on macOS. */
  isContextMenu: boolean;
};

/** `CustomEvent` fired when a `pointerdown` occurs outside the watched element. */
export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;

/** `CustomEvent` fired when focus moves outside the watched element. */
export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>;

/** Union of all outside-interaction event types. */
export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;

/**
 * Options shared by {@link createInteractOutside} and {@link makeInteractOutside}
 * (the latter omits `disabled` via {@link MakeInteractOutsideOptions}).
 */
export interface CreateInteractOutsideOptions {
  /** Whether the interact outside events should be listened or not. */
  disabled?: MaybeAccessor<boolean | undefined>;

  /**
   * When user interacts with the argument element outside the ref,
   * return `true` if the interaction should not trigger the "interact outside" handlers.
   */
  shouldExcludeElement?: (element: Element) => boolean;

  /**
   * Event handler called when a `pointerdown` event happens outside the ref.
   * Can be prevented.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;

  /**
   * Event handler called when the focus moves outside the ref.
   * Can be prevented.
   */
  onFocusOutside?: (event: FocusOutsideEvent) => void;

  /**
   * Event handler called when an interaction happens outside the ref.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   */
  onInteractOutside?: (event: InteractOutsideEvent) => void;
}

/** {@link CreateInteractOutsideOptions} without `disabled` — for use with {@link makeInteractOutside} and {@link interactOutside}. */
export type MakeInteractOutsideOptions = Omit<CreateInteractOutsideOptions, "disabled">;

const POINTER_DOWN_OUTSIDE_EVENT = "interactOutside.pointerDownOutside";
const FOCUS_OUTSIDE_EVENT = "interactOutside.focusOutside";

function composeHandlers(handlers: (((e: any) => void) | undefined)[]): EventListener {
  return (e: Event) => {
    for (const handler of handlers) {
      if (e.defaultPrevented) break;
      handler?.(e);
    }
  };
}

const isMacPlatform = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) return /mac/i.test(uaData.platform);
  return /mac/i.test(navigator.userAgent);
};

const isCtrlKey = (e: PointerEvent): boolean => e.ctrlKey || (isMacPlatform() && e.metaKey);

/**
 * Attaches outside-interaction listeners to `el` immediately and returns a cleanup function.
 * No Solid reactivity — use when you already have a stable element reference.
 *
 * @param el - The element to watch.
 * @param options - Event handlers and `shouldExcludeElement`.
 * @returns A cleanup function that removes all attached listeners.
 *
 * @example
 * ```ts
 * const cleanup = makeInteractOutside(el, {
 *   onInteractOutside: () => close(),
 * });
 * // later:
 * cleanup();
 * ```
 */
export function makeInteractOutside<T extends Element>(
  el: T,
  options: MakeInteractOutsideOptions,
): () => void {
  if (isServer) return noop;

  let clickHandler: () => void = noop;

  // el.ownerDocument may be an about:blank document at ref-apply time if the element was
  // created by a renderer whose `document` global resolved before the real document was ready
  // (e.g. Vite pre-bundled deps in Storybook iframes). Reading el.ownerDocument inside the
  // setTimeout ensures we get the document after the element has been adopted into the real DOM.
  let ownerDoc: Document = el.ownerDocument;

  const isEventOutside = (e: Event): boolean => {
    const target = e.target as Element | null;
    if (!(target instanceof Element)) return false;
    if (!ownerDoc.contains(target)) return false;
    if (el.contains(target)) return false;
    return !(options.shouldExcludeElement?.(target) ?? false);
  };

  const onPointerDown = (e: PointerEvent) => {
    const handler = () => {
      const target = e.target as Element | null;
      if (!target || !isEventOutside(e)) return;

      target.addEventListener(
        POINTER_DOWN_OUTSIDE_EVENT,
        composeHandlers([options.onPointerDownOutside, options.onInteractOutside]),
        { once: true },
      );
      target.dispatchEvent(
        new CustomEvent(POINTER_DOWN_OUTSIDE_EVENT, {
          bubbles: false,
          cancelable: true,
          detail: {
            originalEvent: e,
            isContextMenu: e.button === 2 || (isCtrlKey(e) && e.button === 0),
          } as EventDetails<PointerEvent>,
        }),
      );
    };

    if (e.pointerType === "touch") {
      ownerDoc.removeEventListener("click", clickHandler);
      clickHandler = handler;
      ownerDoc.addEventListener("click", clickHandler, { once: true });
    } else {
      handler();
    }
  };

  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as Element | null;
    if (!target || !isEventOutside(e)) return;

    target.addEventListener(
      FOCUS_OUTSIDE_EVENT,
      composeHandlers([options.onFocusOutside, options.onInteractOutside]),
      { once: true },
    );
    target.dispatchEvent(
      new CustomEvent(FOCUS_OUTSIDE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: {
          originalEvent: e,
          isContextMenu: false,
        } as EventDetails<FocusEvent>,
      }),
    );
  };

  // Delay listener registration to:
  // 1. Avoid triggering on the event that caused this mount.
  // 2. Re-read el.ownerDocument after the element has been adopted into the real DOM
  //    (it may have been created in an about:blank context by a pre-bundled renderer).
  const pointerDownTimeoutId = window.setTimeout(() => {
    ownerDoc = el.ownerDocument;
    ownerDoc.addEventListener("pointerdown", onPointerDown, true);
    ownerDoc.addEventListener("focusin", onFocusIn, true);
  }, 0);

  return () => {
    window.clearTimeout(pointerDownTimeoutId);
    ownerDoc.removeEventListener("click", clickHandler);
    ownerDoc.removeEventListener("pointerdown", onPointerDown, true);
    ownerDoc.removeEventListener("focusin", onFocusIn, true);
  };
}

/**
 * Ref factory for `makeInteractOutside`. Call it in a component body and pass the
 * result directly to a JSX `ref` prop. Cleanup is registered via `onCleanup` in the
 * component's reactive scope so listeners are removed automatically when the component disposes.
 *
 * @param options - Event handlers and `shouldExcludeElement`.
 * @returns A ref callback `(el: Element) => void` suitable for use as a JSX `ref`.
 *
 * @example
 * ```tsx
 * function Popover() {
 *   const [open, setOpen] = createSignal(false);
 *   return (
 *     <Show when={open()}>
 *       <div ref={interactOutside({ onInteractOutside: () => setOpen(false) })}>
 *         Popover content
 *       </div>
 *     </Show>
 *   );
 * }
 * ```
 */
export function interactOutside(options: MakeInteractOutsideOptions): (el: Element) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());
  return el => {
    cleanup = makeInteractOutside(el, options);
  };
}

/**
 * Listens for pointer and focus events that originate outside a referenced element.
 * Reactively re-attaches whenever `ref` or `options.disabled` changes.
 * Cleans up automatically with the reactive owner.
 *
 * @param options - Configuration, event handlers, and optional `disabled` accessor.
 * @param ref - Accessor returning the element to watch.
 *
 * @example
 * ```tsx
 * function Popover() {
 *   const [ref, setRef] = createSignal<HTMLDivElement>();
 *   const [open, setOpen] = createSignal(true);
 *
 *   createInteractOutside(
 *     { onInteractOutside: () => setOpen(false) },
 *     ref,
 *   );
 *
 *   return <Show when={open()}><div ref={setRef}>Popover content</div></Show>;
 * }
 * ```
 */
export function createInteractOutside<T extends Element>(
  options: CreateInteractOutsideOptions,
  ref: Accessor<T | undefined>,
): void {
  if (isServer) return;

  createEffect(
    () => ({ disabled: access(options.disabled), el: ref() }),
    ({ disabled, el }: { disabled: boolean | undefined; el: T | undefined }) => {
      if (disabled || !el) return;
      return makeInteractOutside(el, options);
    },
  );
}
