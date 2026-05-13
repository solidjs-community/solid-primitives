/*
 * Ported from solid-focus-trap by Jasmin Noetzli (GiyoMoon)
 * MIT License — https://github.com/corvudev/corvu/tree/main/packages/solid-focus-trap
 * Adapted for Solid.js 2.0 and @solid-primitives/focus by the Solid Primitives Working Group.
 */

import { access, afterPaint, INTERNAL_OPTIONS, type MaybeAccessor } from "@solid-primitives/utils";
import { createEffect, createMemo, createSignal } from "solid-js";

const FOCUSABLE_SELECTOR =
  'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), textarea:not([tabindex="-1"]), select:not([tabindex="-1"]), details:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

const EVENT_INITIAL_FOCUS = "focusTrap.initialFocus";
const EVENT_FINAL_FOCUS = "focusTrap.finalFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true } as const;

export type CreateFocusTrapProps = {
  /** Element to trap focus within. */
  element: MaybeAccessor<HTMLElement | null>;
  /** Whether the focus trap is active. Default: `true` */
  enabled?: MaybeAccessor<boolean>;
  /**
   * Watch for DOM mutations inside the container and reload the list of
   * focusable elements accordingly. Default: `true`
   */
  observeChanges?: MaybeAccessor<boolean>;
  /**
   * Element to focus when the trap activates.
   * Default: the first focusable element inside `element`.
   */
  initialFocusElement?: MaybeAccessor<HTMLElement | null>;
  /**
   * Restore focus to the element that was focused before the trap activated
   * when the trap is deactivated. Default: `true`
   */
  restoreFocus?: MaybeAccessor<boolean>;
  /**
   * Element to focus when the trap deactivates.
   * Default: the element that was focused before the trap activated.
   */
  finalFocusElement?: MaybeAccessor<HTMLElement | null>;
  /**
   * Callback fired when focus moves into the trap.
   * Call `event.preventDefault()` to suppress the focus move.
   */
  onInitialFocus?: (event: Event) => void;
  /**
   * Callback fired when focus is restored after deactivation.
   * Call `event.preventDefault()` to suppress the focus move.
   */
  onFinalFocus?: (event: Event) => void;
};

/**
 * Traps focus inside the given element. Aware of DOM changes inside the trap
 * via a MutationObserver. Properly restores focus when deactivated.
 *
 * Ported from [solid-focus-trap](https://github.com/corvudev/corvu/tree/main/packages/solid-focus-trap)
 * by Jasmin Noetzli (GiyoMoon), adapted for Solid.js 2.0.
 *
 * @example
 * ```tsx
 * const [ref, setRef] = createSignal<HTMLElement | null>(null);
 * createFocusTrap({ element: ref, enabled: () => isOpen() });
 * <div ref={setRef}>...</div>
 * ```
 */
export const createFocusTrap = (props: CreateFocusTrapProps): void => {
  const [focusableElements, setFocusableElements] = createSignal<HTMLElement[] | null>(
    null,
    INTERNAL_OPTIONS,
  );

  const firstFocusElement = createMemo(() => {
    const els = focusableElements();
    return els ? (els[0] ?? null) : null;
  });

  const lastFocusElement = createMemo(() => {
    const els = focusableElements();
    return els ? (els[els.length - 1] ?? null) : null;
  });

  let originalFocusedElement: HTMLElement | null = null;

  const loadFocusableElements = (container: HTMLElement) => {
    const sorted = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .map((element, domIndex) => ({ element, domIndex, tabIndex: element.tabIndex }))
      .sort((a, b) =>
        a.tabIndex === b.tabIndex ? a.domIndex - b.domIndex : a.tabIndex - b.tabIndex,
      );
    setFocusableElements(sorted.map(({ element }) => element));
  };

  const triggerInitialFocus = (container: HTMLElement) => {
    afterPaint(() => {
      const target = access(props.initialFocusElement ?? null) ?? firstFocusElement() ?? container;
      const { onInitialFocus } = props;
      if (onInitialFocus) {
        const event = new CustomEvent(EVENT_INITIAL_FOCUS, EVENT_OPTIONS);
        container.addEventListener(EVENT_INITIAL_FOCUS, onInitialFocus);
        container.dispatchEvent(event);
        container.removeEventListener(EVENT_INITIAL_FOCUS, onInitialFocus);
        if (event.defaultPrevented) return;
      }
      target.focus();
    });
  };

  const triggerRestoreFocus = (container: HTMLElement) => {
    afterPaint(() => {
      if (!access(props.restoreFocus ?? true)) return;
      const target = access(props.finalFocusElement ?? null) ?? originalFocusedElement;
      if (!target) return;
      const { onFinalFocus } = props;
      if (onFinalFocus) {
        const event = new CustomEvent(EVENT_FINAL_FOCUS, EVENT_OPTIONS);
        container.addEventListener(EVENT_FINAL_FOCUS, onFinalFocus);
        container.dispatchEvent(event);
        container.removeEventListener(EVENT_FINAL_FOCUS, onFinalFocus);
        if (event.defaultPrevented) return;
      }
      target.focus();
    });
  };

  const onFirstElementKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      lastFocusElement()!.focus();
    }
  };

  const onLastElementKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      firstFocusElement()!.focus();
    }
  };

  const preventTab = (event: KeyboardEvent) => {
    if (event.key === "Tab") event.preventDefault();
  };

  // Activate / deactivate the trap when element or enabled changes.
  createEffect(
    () => ({
      container: access(props.element),
      enabled: access(props.enabled ?? true),
      observeChanges: access(props.observeChanges ?? true),
    }),
    ({ container, enabled, observeChanges }) => {
      if (!container || !enabled) return;

      originalFocusedElement = document.activeElement as HTMLElement | null;
      loadFocusableElements(container);
      triggerInitialFocus(container);

      const observer = new MutationObserver(() => {
        afterPaint(() => {
          loadFocusableElements(container);
          if (!document.activeElement || document.activeElement === document.body) {
            triggerInitialFocus(container);
          }
        });
      });

      if (observeChanges) {
        observer.observe(container, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["tabindex"],
        });
      }

      return () => {
        if (observeChanges) observer.disconnect();
        setFocusableElements(null);
        triggerRestoreFocus(container);
      };
    },
  );

  // When there are no focusable elements, block all Tab key presses.
  createEffect(
    () => focusableElements(),
    elements => {
      if (elements === null || elements.length !== 0) return;
      document.addEventListener("keydown", preventTab);
      return () => document.removeEventListener("keydown", preventTab);
    },
  );

  // Shift+Tab on the first element → wrap to last.
  createEffect(
    () => firstFocusElement(),
    el => {
      if (!el) return;
      el.addEventListener("keydown", onFirstElementKeyDown);
      return () => el.removeEventListener("keydown", onFirstElementKeyDown);
    },
  );

  // Tab on the last element → wrap to first.
  createEffect(
    () => lastFocusElement(),
    el => {
      if (!el) return;
      el.addEventListener("keydown", onLastElementKeyDown);
      return () => el.removeEventListener("keydown", onLastElementKeyDown);
    },
  );
};
