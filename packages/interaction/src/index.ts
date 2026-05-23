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

export type EventDetails<T> = {
  originalEvent: T;
  isContextMenu: boolean;
};

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;
export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>;
export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;

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
  const ownerDoc = el.ownerDocument;

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

  // Delay pointerdown registration to avoid triggering on the event that caused this mount.
  const pointerDownTimeoutId = window.setTimeout(() => {
    ownerDoc.addEventListener("pointerdown", onPointerDown, true);
  }, 0);

  ownerDoc.addEventListener("focusin", onFocusIn, true);

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
