import { onCleanup } from "solid-js";
import { registerPointerListener } from "./core.js";
import type { PointerCallback } from "./core.js";

export type LongPressProps = {
  callback: (position: { x: number; y: number }) => void;
  threshold?: number;     // ms to hold before firing (default: 500)
  moveThreshold?: number; // px of movement that cancels the gesture (default: 10)
};

export function longPress(props: LongPressProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let startX = 0;
    let startY = 0;

    function cancelTimer() {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    }

    const onDown: PointerCallback = (activeEvents, event) => {
      // a second pointer cancels any pending long press
      if (activeEvents.length !== 1) {
        cancelTimer();
        return;
      }
      startX = event.clientX;
      startY = event.clientY;
      cancelTimer();

      const threshold = props.threshold ?? 500;
      timer = setTimeout(() => {
        timer = undefined;
        const rect = node.getBoundingClientRect();
        props.callback({
          x: Math.round(startX - rect.left),
          y: Math.round(startY - rect.top),
        });
      }, threshold);
    };

    const onMove: PointerCallback = (_, event) => {
      const moveThreshold = props.moveThreshold ?? 10;
      if (
        Math.abs(event.clientX - startX) > moveThreshold ||
        Math.abs(event.clientY - startY) > moveThreshold
      ) {
        cancelTimer();
      }
    };

    const onUp: PointerCallback = () => {
      cancelTimer();
    };

    const stopListening = registerPointerListener(node, onDown, onMove, onUp);
    cleanup = () => {
      stopListening();
      cancelTimer();
    };
  };
}
