import { onCleanup } from "solid-js";
import { registerPointerListener, getCenterOfTwoPoints } from "./core.js";

export type PinchProps = {
  callback: (scale: number, pinchCenter: { x: number; y: number }) => void;
};

function getPointersDistance(activeEvents: PointerEvent[]) {
  return Math.hypot(
    activeEvents[0]!.clientX - activeEvents[1]!.clientX,
    activeEvents[0]!.clientY - activeEvents[1]!.clientY,
  );
}

export function pinch(props: PinchProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    let prevDistance: number | undefined = undefined;
    let initDistance = 0;
    let pinchCenter: { x: number; y: number };

    function onUp(activeEvents: PointerEvent[]) {
      if (activeEvents.length === 1) {
        prevDistance = undefined;
      }
    }

    function onDown(activeEvents: PointerEvent[]) {
      if (activeEvents.length === 2) {
        initDistance = getPointersDistance(activeEvents);
        pinchCenter = getCenterOfTwoPoints(node, activeEvents);
      }
    }

    function onMove(activeEvents: PointerEvent[]) {
      if (activeEvents.length === 2) {
        const curDistance = getPointersDistance(activeEvents);

        if (prevDistance !== undefined && curDistance !== prevDistance) {
          const scale = curDistance / initDistance;
          props.callback(scale, pinchCenter);
        }
        prevDistance = curDistance;
      }
    }

    cleanup = registerPointerListener(node, onDown, onMove, onUp);
  };
}
