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
 * And from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/810579b671791f1593108f62cdc1893de3a220e3/packages/@react-aria/overlays/src/ariaHideOutside.ts
 */

import { type Accessor, createEffect } from "solid-js";
import { type MaybeAccessor, access, isServer, noop } from "@solid-primitives/utils";

export type EventDetails<T> = {
  originalEvent: T;
  isContextMenu: boolean;
};

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;
export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>;
export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;

export interface CreateInteractOutsideProps {
  /** Whether the interact outside events should be listened or not. */
  isDisabled?: MaybeAccessor<boolean | undefined>;

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
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /mac/i.test(platform);
};

const isCtrlKey = (e: PointerEvent): boolean => e.ctrlKey || (isMacPlatform() && e.metaKey);

/**
 * Listens for pointer and focus events that originate outside a referenced element.
 *
 * Fires `onPointerDownOutside`, `onFocusOutside`, and `onInteractOutside` when
 * the user interacts with any part of the page outside the element referenced by `ref`.
 * Each event is a `CustomEvent` that wraps the original DOM event and can be cancelled
 * with `event.preventDefault()` to stop subsequent handlers from firing.
 *
 * @param props - Configuration and event handlers.
 * @param ref - Accessor returning the element to watch.
 *
 * @example
 * ```tsx
 * function Popover() {
 *   let ref: HTMLDivElement | undefined;
 *   const [open, setOpen] = createSignal(true);
 *
 *   createInteractOutside(
 *     { onInteractOutside: () => setOpen(false) },
 *     () => ref,
 *   );
 *
 *   return <Show when={open()}><div ref={ref}>Popover content</div></Show>;
 * }
 * ```
 */
export function createInteractOutside<T extends Element>(
  props: CreateInteractOutsideProps,
  ref: Accessor<T | undefined>,
): void {
  if (isServer) return;

  let pointerDownTimeoutId: number | undefined;
  let clickHandler: () => void = noop;

  const isEventOutside = (e: Event): boolean => {
    const target = e.target as Element | null;
    if (!(target instanceof Element)) return false;
    const el = ref();
    if (!el) return false;
    if (!el.ownerDocument.contains(target)) return false;
    if (el.contains(target)) return false;
    return !(props.shouldExcludeElement?.(target) ?? false);
  };

  const onPointerDown = (e: PointerEvent) => {
    const handler = () => {
      const target = e.target as Element | null;
      if (!ref() || !target || !isEventOutside(e)) return;

      target.addEventListener(
        POINTER_DOWN_OUTSIDE_EVENT,
        composeHandlers([props.onPointerDownOutside, props.onInteractOutside]),
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

    // On touch devices, wait for the click event (~350ms delay) before firing.
    // We continuously remove the previous listener since we can't be certain it fired.
    if (e.pointerType === "touch") {
      const ownerDoc = ref()?.ownerDocument ?? document;
      ownerDoc.removeEventListener("click", clickHandler);
      clickHandler = handler;
      ownerDoc.addEventListener("click", clickHandler, { once: true });
    } else {
      handler();
    }
  };

  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as Element | null;
    if (!ref() || !target || !isEventOutside(e)) return;

    target.addEventListener(
      FOCUS_OUTSIDE_EVENT,
      composeHandlers([props.onFocusOutside, props.onInteractOutside]),
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

  // Delay the pointerdown listener registration to avoid triggering on the
  // same event that caused this component to mount.
  // The apply function returns a teardown function; Solid 2.0 calls it before
  // re-running apply or when the owner is disposed (no onCleanup needed).
  createEffect(
    () => ({ disabled: access(props.isDisabled), el: ref() }),
    ({ disabled, el }: { disabled: boolean | undefined; el: T | undefined }) => {
      if (disabled || !el) return;

      const ownerDoc = el.ownerDocument;

      pointerDownTimeoutId = window.setTimeout(() => {
        ownerDoc.addEventListener("pointerdown", onPointerDown, true);
      }, 0);

      ownerDoc.addEventListener("focusin", onFocusIn, true);

      return () => {
        window.clearTimeout(pointerDownTimeoutId);
        ownerDoc.removeEventListener("click", clickHandler);
        ownerDoc.removeEventListener("pointerdown", onPointerDown, true);
        ownerDoc.removeEventListener("focusin", onFocusIn, true);
      };
    },
  );
}

// ─── ariaHideOutside / createHideOutside ─────────────────────────────────────

export interface CreateHideOutsideProps {
  /** The elements that should remain visible. */
  targets: MaybeAccessor<Array<Element>>;

  /** Nothing will be hidden above this element. */
  root?: MaybeAccessor<HTMLElement | undefined>;

  /** Whether the hide outside behavior is disabled or not. */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

interface ObserverWrapper {
  observe(): void;
  disconnect(): void;
}

// Module-level ref count and observer stack shared across all active ariaHideOutside calls.
const refCountMap = new WeakMap<Element, number>();
const observerStack: ObserverWrapper[] = [];

/**
 * Hides all elements in the DOM outside the given targets from screen readers using `aria-hidden`,
 * and returns a function to revert these changes. Changes to the DOM are watched and new elements
 * outside the targets are automatically hidden.
 *
 * @param targets - The elements that should remain visible.
 * @param root - Nothing will be hidden above this element. Defaults to `document.body`.
 * @returns A function that restores all hidden elements.
 *
 * @example
 * ```ts
 * const restore = ariaHideOutside([dialogEl]);
 * // later:
 * restore();
 * ```
 */
export function ariaHideOutside(targets: Element[], root = document.body): () => void {
  const visibleNodes = new Set<Element>(targets);
  const hiddenNodes = new Set<Element>();

  const hide = (node: Element) => {
    const refCount = refCountMap.get(node) ?? 0;

    // Already aria-hidden before we touched it — nothing to do.
    if (node.getAttribute("aria-hidden") === "true" && refCount === 0) {
      return;
    }

    if (refCount === 0) {
      node.setAttribute("aria-hidden", "true");
    }

    hiddenNodes.add(node);
    refCountMap.set(node, refCount + 1);
  };

  const walk = (walkRoot: Element) => {
    const acceptNode = (node: Element) => {
      // Skip node and children if it is a target, or is a non-row child of a hidden element.
      // Elements with role="row" are excepted because VoiceOver on iOS has issues hiding
      // elements with role="row" (https://bugs.webkit.org/show_bug.cgi?id=222623).
      if (
        visibleNodes.has(node) ||
        (node.parentElement &&
          hiddenNodes.has(node.parentElement) &&
          node.parentElement.getAttribute("role") !== "row")
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      // Skip this node but continue to children if a target is inside it.
      for (const target of visibleNodes) {
        if (node.contains(target)) {
          return NodeFilter.FILTER_SKIP;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    };

    const walker = document.createTreeWalker(walkRoot, NodeFilter.SHOW_ELEMENT, { acceptNode });

    const acceptRoot = acceptNode(walkRoot);
    if (acceptRoot === NodeFilter.FILTER_ACCEPT) {
      hide(walkRoot);
    }

    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = walker.nextNode() as Element | null;
      while (node !== null) {
        hide(node);
        node = walker.nextNode() as Element | null;
      }
    }
  };

  // Suspend any existing observer so the new one takes over.
  if (observerStack.length) {
    observerStack[observerStack.length - 1]!.disconnect();
  }

  walk(root);

  const observer = new MutationObserver(changes => {
    for (const change of changes) {
      if (change.type !== "childList" || change.addedNodes.length === 0) {
        continue;
      }

      // Only process additions outside visible/hidden nodes.
      if (![...visibleNodes, ...hiddenNodes].some(node => node.contains(change.target))) {
        for (const node of Array.from(change.removedNodes)) {
          if (node instanceof Element) {
            visibleNodes.delete(node);
            hiddenNodes.delete(node);
          }
        }

        for (const node of Array.from(change.addedNodes)) {
          if (node instanceof Element) {
            walk(node);
          }
        }
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  const observerWrapper: ObserverWrapper = {
    observe() {
      observer.observe(root, { childList: true, subtree: true });
    },
    disconnect() {
      observer.disconnect();
    },
  };

  observerStack.push(observerWrapper);

  return () => {
    observer.disconnect();

    for (const node of hiddenNodes) {
      const count = refCountMap.get(node);
      if (count == null) return;

      if (count === 1) {
        node.removeAttribute("aria-hidden");
        refCountMap.delete(node);
      } else {
        refCountMap.set(node, count - 1);
      }
    }

    // Remove this wrapper from the stack and resume the previous observer.
    if (observerWrapper === observerStack[observerStack.length - 1]) {
      observerStack.pop();
      if (observerStack.length) {
        observerStack[observerStack.length - 1]!.observe();
      }
    } else {
      observerStack.splice(observerStack.indexOf(observerWrapper), 1);
    }
  };
}

/**
 * Reactive wrapper around `ariaHideOutside`. Hides all elements outside the given `targets`
 * from screen readers, re-running whenever any of the provided accessors change.
 *
 * @param props - Configuration including the targets to keep visible, an optional root, and
 *   an optional disabled flag.
 *
 * @example
 * ```tsx
 * function Dialog() {
 *   let ref: HTMLDivElement | undefined;
 *   const [open, setOpen] = createSignal(true);
 *
 *   createHideOutside({
 *     targets: () => (ref ? [ref] : []),
 *     isDisabled: () => !open(),
 *   });
 *
 *   return <Show when={open()}><div ref={ref}>Dialog content</div></Show>;
 * }
 * ```
 */
export function createHideOutside(props: CreateHideOutsideProps): void {
  if (isServer) return;

  createEffect(
    () => ({
      disabled: access(props.isDisabled),
      targets: access(props.targets),
      root: access(props.root),
    }),
    ({
      disabled,
      targets,
      root,
    }: {
      disabled: boolean | undefined;
      targets: Element[];
      root: HTMLElement | undefined;
    }) => {
      if (disabled) return;
      return ariaHideOutside(targets, root);
    },
  );
}
