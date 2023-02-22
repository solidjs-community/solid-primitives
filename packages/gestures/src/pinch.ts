import { registerPointerListener, getCenterOfTwoPoints } from "./core";

type Props = {
  callback: (scale: number, pinchCenter: { x: number; y: number }) => any;
};

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      ["use:pinch"]?: Props;
    }
  }
}

function getPointersDistance(activeEvents: PointerEvent[]) {
  return Math.hypot(
    activeEvents[0]!.clientX - activeEvents[1]!.clientX,
    activeEvents[0]!.clientY - activeEvents[1]!.clientY
  );
}

export function pinch(node: HTMLElement, props: () => Props) {
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
        props().callback(scale, pinchCenter);
      }
      prevDistance = curDistance;
    }
  }

  return registerPointerListener(node, onDown, onMove, onUp);
}
