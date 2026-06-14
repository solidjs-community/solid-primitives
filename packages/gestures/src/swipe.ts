import { onCleanup } from "solid-js";
import { registerPointerListener, DEFAULT_DELAY, DEFAULT_MIN_SWIPE_DISTANCE } from "./core.js";

export type SwipeProps = {
  callback: (direction: "top" | "right" | "bottom" | "left") => void;
  parameters?: {
    timeframe?: number;
    minSwipeDistance?: number;
  };
};

export function swipe(props: SwipeProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    let startTime = 0;
    let clientX: number;
    let clientY: number;

    function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
      if (activeEvents.length === 1) {
        clientX = event.clientX;
        clientY = event.clientY;
        startTime = Date.now();
      } else {
        startTime = 0;
      }
    }

    function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
      const timeframe = props.parameters?.timeframe ?? DEFAULT_DELAY;
      if (activeEvents.length === 0 && startTime > 0 && Date.now() - startTime < timeframe) {
        const x = event.clientX - clientX;
        const y = event.clientY - clientY;
        const absX = Math.abs(x);
        const absY = Math.abs(y);

        let direction: "top" | "right" | "bottom" | "left" | undefined;
        const minSwipeDistance = props.parameters?.minSwipeDistance ?? DEFAULT_MIN_SWIPE_DISTANCE;
        if (absX >= 2 * absY && absX > minSwipeDistance) {
          // horizontal (2× factor eliminates diagonal movements)
          direction = x > 0 ? "right" : "left";
        } else if (absY >= 2 * absX && absY > minSwipeDistance) {
          // vertical
          direction = y > 0 ? "bottom" : "top";
        }
        if (direction) {
          props.callback(direction);
        }
      }
    }

    cleanup = registerPointerListener(node, onDown, undefined, onUp);
  };
}
