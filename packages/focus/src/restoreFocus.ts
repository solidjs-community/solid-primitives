/**
 * Shared "restore focus on deactivation" ceremony used by both `createFocusTrap` (trap + restore)
 * and the standalone `createFocusRestore` (restore only, no trap).
 */

import { afterPaint } from "@solid-primitives/utils";

const EVENT_OPTIONS = { bubbles: false, cancelable: true } as const;

export type ScheduleFocusRestoreOptions = {
  /** Element to dispatch the cancelable `onFinalFocus` custom event on. Read live (at fire time). */
  resolveEventTarget: () => Element;
  eventName: string;
  /** Read live (at fire time). Return `false` to abort the restore for this cycle. */
  shouldRestore?: () => boolean;
  /** Live override target (e.g. an explicit `finalFocusElement` option); wins over `fallbackTarget`. */
  resolveTarget: () => HTMLElement | null;
  /**
   * The element to fall back to when `resolveTarget()` returns `null` — must be captured by the
   * caller *synchronously*, at the moment deactivation begins (before scheduling this), not read
   * lazily from a mutable outer variable. Otherwise a later activation cycle can reassign that
   * variable before this runs, restoring focus to the wrong element.
   */
  fallbackTarget: HTMLElement | null;
  onFinalFocus?: (event: Event) => void;
};

/**
 * Schedules (via `afterPaint`) a cancelable-custom-event-gated focus restore.
 */
export function scheduleFocusRestore(options: ScheduleFocusRestoreOptions): void {
  const { resolveEventTarget, eventName, shouldRestore, resolveTarget, fallbackTarget, onFinalFocus } =
    options;
  afterPaint(() => {
    if (shouldRestore && !shouldRestore()) return;
    const target = resolveTarget() ?? fallbackTarget;
    if (!target) return;
    if (onFinalFocus) {
      const eventTarget = resolveEventTarget();
      const event = new CustomEvent(eventName, EVENT_OPTIONS);
      eventTarget.addEventListener(eventName, onFinalFocus);
      eventTarget.dispatchEvent(event);
      eventTarget.removeEventListener(eventName, onFinalFocus);
      if (event.defaultPrevented) return;
    }
    target.focus();
  });
}
