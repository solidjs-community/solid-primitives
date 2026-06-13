import { onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";

/** Politeness level for ARIA live region announcements. */
export type AnnouncePoliteness = "polite" | "assertive";

/** Function that sends a message to screen readers via an ARIA live region. */
export type Announce = (message: string, politeness?: AnnouncePoliteness) => void;

function createLiveRegionEl(politeness: AnnouncePoliteness): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("aria-live", politeness);
  el.setAttribute("aria-atomic", "true");
  // visually hidden but announced by screen readers (clip pattern)
  el.style.cssText =
    "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
  return el;
}

/**
 * Non-reactive base for screen reader announcements. Creates two visually-hidden ARIA live
 * region elements on `document.body` and returns an `[announce, cleanup]` tuple.
 *
 * Call `cleanup()` to remove the elements from the DOM when done.
 * Prefer `createAnnounce` inside a Solid component — it registers `onCleanup` automatically.
 *
 * @returns `[announce, cleanup]`
 *
 * @example
 * ```ts
 * const [announce, cleanup] = makeAnnounce();
 * announce("Changes saved successfully");
 * announce("Critical error — please try again", "assertive");
 * // when done:
 * cleanup();
 * ```
 */
export function makeAnnounce(): [announce: Announce, cleanup: () => void] {
  if (isServer) return [() => {}, () => {}];

  const regions: Record<AnnouncePoliteness, HTMLDivElement> = {
    polite: createLiveRegionEl("polite"),
    assertive: createLiveRegionEl("assertive"),
  };

  document.body.appendChild(regions.polite);
  document.body.appendChild(regions.assertive);

  const timers: Record<AnnouncePoliteness, ReturnType<typeof setTimeout> | undefined> = {
    polite: undefined,
    assertive: undefined,
  };

  const announce: Announce = (message, politeness = "polite") => {
    const el = regions[politeness];
    // Clear content first so screen readers re-announce identical messages
    el.textContent = "";
    clearTimeout(timers[politeness]);
    timers[politeness] = setTimeout(() => {
      el.textContent = message;
    }, 50);
  };

  const cleanup = () => {
    clearTimeout(timers.polite);
    clearTimeout(timers.assertive);
    regions.polite.remove();
    regions.assertive.remove();
  };

  return [announce, cleanup];
}

/**
 * Creates ARIA live region elements that enable programmatic screen reader announcements.
 * Two visually-hidden divs are appended to `document.body` and removed when the reactive
 * owner disposes.
 *
 * Use `"polite"` (default) for status messages — the screen reader waits for idle before
 * announcing. Use `"assertive"` for urgent errors — it interrupts whatever the reader is
 * currently saying.
 *
 * @returns `announce(message, politeness?)` — call at any time to send a message.
 *
 * @example
 * ```ts
 * const announce = createAnnounce();
 *
 * // status update — waits for screen reader to finish current sentence
 * announce("3 results found");
 *
 * // urgent error — interrupts immediately
 * announce("Session expired. Please sign in again.", "assertive");
 * ```
 */
export function createAnnounce(): Announce {
  const [announce, cleanup] = makeAnnounce();
  onCleanup(cleanup);
  return announce;
}
