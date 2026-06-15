import { onCleanup } from "solid-js";
import { registerPointerListener } from "./core.js";
import type { PointerCallback } from "./core.js";

export type DoubleTapProps = {
  callback: (position: { x: number; y: number }) => void;
  timeframe?: number;          // ms window between taps (default: 300)
  positionThreshold?: number;  // max px distance between tap positions (default: 30)
};

export function doubleTap(props: DoubleTapProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    let downX = 0;
    let downY = 0;
    let downTime = 0;
    let firstTapX = 0;
    let firstTapY = 0;
    let firstTapTime = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function clearTimer() {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    }

    const onDown: PointerCallback = (activeEvents, event) => {
      if (activeEvents.length > 1) {
        // multi-pointer cancels any pending first-tap window
        clearTimer();
        firstTapTime = 0;
        cancelled = true;
        return;
      }
      downX = event.clientX;
      downY = event.clientY;
      downTime = Date.now();
      cancelled = false;
    };

    const onUp: PointerCallback = (activeEvents, event) => {
      if (activeEvents.length !== 0 || cancelled) return;

      const drift = Math.hypot(event.clientX - downX, event.clientY - downY);
      if (drift >= 4) return;

      const now = Date.now();
      if (now - downTime > 600) return; // held too long — not a tap

      const timeframe = props.timeframe ?? 300;
      const posThreshold = props.positionThreshold ?? 30;

      if (firstTapTime > 0) {
        const timeDiff = now - firstTapTime;
        const posDiff = Math.hypot(event.clientX - firstTapX, event.clientY - firstTapY);

        if (timeDiff <= timeframe && posDiff <= posThreshold) {
          clearTimer();
          firstTapTime = 0;
          const rect = node.getBoundingClientRect();
          props.callback({
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top),
          });
          return;
        }
      }

      // record this as the first tap and start the window
      clearTimer();
      firstTapX = event.clientX;
      firstTapY = event.clientY;
      firstTapTime = now;
      timer = setTimeout(() => {
        timer = undefined;
        firstTapTime = 0;
      }, timeframe);
    };

    const stopListening = registerPointerListener(node, onDown, undefined, onUp);
    cleanup = () => {
      stopListening();
      clearTimer();
    };
  };
}
