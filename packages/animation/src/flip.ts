/**
 * FLIP (First–Last–Invert–Play) layout animation using WAAPI.
 *
 * Call `snapshot()` immediately before the DOM change, then `flip()` immediately
 * after. `flip()` reads the new geometry, inverts the delta, and plays the
 * animation from the old position/size to the new one.
 *
 * Note: geometry is measured in viewport coordinates via `getBoundingClientRect`.
 * Elements inside `position: fixed/absolute` ancestors will need their own
 * coordinate adjustment.
 */
export function makeFlip(
  el: Element,
  options?: KeyframeAnimationOptions,
): { snapshot: () => void; flip: () => Animation | undefined } {
  let rect: DOMRect | undefined;

  return {
    snapshot() {
      rect = el.getBoundingClientRect();
    },
    flip() {
      if (!rect) return;
      const next = el.getBoundingClientRect();
      const prev = rect;
      rect = undefined;
      if (next.width === 0 || next.height === 0) return;
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      const sx = prev.width / next.width;
      const sy = prev.height / next.height;
      if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return;
      return el.animate(
        [
          { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transformOrigin: "top left", transform: "none" },
        ],
        options,
      );
    },
  };
}
