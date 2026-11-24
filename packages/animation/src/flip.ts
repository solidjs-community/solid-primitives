/**
 * FLIP (First–Last–Invert–Play) layout animation using WAAPI.
 *
 * Call `snapshot()` immediately before the DOM change, then `flip()` immediately
 * after. `flip()` reads the new geometry, inverts the delta, and plays the
 * animation from the old position/size to the new one.
 *
 * Solid 2 batches signal writes, so call `flush()` (from `solid-js`) between the
 * state change and `flip()`; otherwise `flip()` measures the unchanged layout and
 * is a silent no-op.
 *
 * Geometry is measured in viewport coordinates via `getBoundingClientRect`, so
 * scrolling between `snapshot()` and `flip()` skews the result. Resizing via
 * `scale()` also stretches the element's children. `fill` defaults to
 * `"backwards"` so a `delay` doesn't show the final position early.
 */
export function makeFlip(
  el: Element,
  options?: KeyframeAnimationOptions,
): { snapshot: () => void; flip: () => Animation | undefined } {
  let rect: DOMRect | undefined;
  let current: Animation | undefined;

  return {
    snapshot() {
      rect = el.getBoundingClientRect();
    },
    flip() {
      if (!rect) return;
      // Cancel any in-flight flip first so `next` is measured without its transform.
      // `snapshot()` deliberately measured *with* it, keeping an interrupted motion continuous.
      current?.cancel();
      current = undefined;
      const next = el.getBoundingClientRect();
      const prev = rect;
      rect = undefined;
      if (next.width === 0 || next.height === 0) return;
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      const sx = prev.width / next.width;
      const sy = prev.height / next.height;
      if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return;
      return (current = el.animate(
        [
          {
            transformOrigin: "top left",
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          },
          { transformOrigin: "top left", transform: "none" },
        ],
        { fill: "backwards", ...options },
      ));
    },
  };
}
