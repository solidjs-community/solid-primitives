/*
 * Adapted for @solid-primitives/focus by the Solid Primitives Working Group.
 * Reuses the restore-focus half of createFocusTrap (see focusTrap.ts) as a
 * standalone primitive for non-modal surfaces (Popover, Tooltip) that must
 * return focus to their trigger on close but must not intercept Tab
 * navigation the way a full focus trap does.
 */

import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { createEffect } from "solid-js";
import { scheduleFocusRestore } from "./restoreFocus.ts";

const EVENT_FINAL_FOCUS = "focusRestore.finalFocus";

export type CreateFocusRestoreProps = {
  /** Whether focus-restore is active. Default: `true` */
  enabled?: MaybeAccessor<boolean>;
  /**
   * Element to dispatch the `onFinalFocus` event on. Defaults to `document.body`.
   */
  element?: MaybeAccessor<HTMLElement | undefined>;
  /**
   * Element to focus when deactivated.
   * Default: the element that was focused when activated.
   */
  finalFocusElement?: MaybeAccessor<HTMLElement | undefined>;
  /**
   * Callback fired when focus is restored.
   * Call `event.preventDefault()` to suppress the focus move.
   */
  onFinalFocus?: (event: Event) => void;
};

/**
 * Saves the currently focused element while active and restores focus to it
 * once deactivated — without trapping focus or managing tab order.
 *
 * For a non-modal Popover/Tooltip/Menu that should return focus to its trigger
 * on close but must not intercept Tab navigation while open. For the full
 * trap-and-restore behavior (modal dialogs) use {@link createFocusTrap}, whose
 * `restoreFocus` option covers the same restore behavior alongside trapping.
 *
 * @example
 * ```tsx
 * const [ref, setRef] = createSignal<HTMLElement>();
 * createFocusRestore({ enabled: () => isOpen(), element: ref });
 * <div ref={setRef}>...</div>
 * ```
 */
export const createFocusRestore = (props: CreateFocusRestoreProps = {}): void => {
  let originalFocusedElement: HTMLElement | null = null;

  createEffect(
    () => access(props.enabled ?? true),
    enabled => {
      if (!enabled) return;

      originalFocusedElement = document.activeElement as HTMLElement | null;

      return () => {
        scheduleFocusRestore({
          resolveEventTarget: () => access(props.element) ?? document.body,
          eventName: EVENT_FINAL_FOCUS,
          resolveTarget: () => access(props.finalFocusElement) ?? null,
          // Snapshot now, synchronously — the restore is scheduled via afterPaint (deferred by a
          // couple of animation frames), and a later activation before it fires would otherwise
          // overwrite originalFocusedElement out from under the still-pending restore.
          fallbackTarget: originalFocusedElement,
          onFinalFocus: props.onFinalFocus,
        });
      };
    },
  );
};
