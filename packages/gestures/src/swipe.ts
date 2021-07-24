import { registerPointerListener, DEFAULT_DELAY, DEFAULT_MIN_SWIPE_DISTANCE } from "./core";

type Props = {
  callback: (direction: "top" | "right" | "bottom" | "left") => any;
  parameters?: {
    timeframe?: number;
    minSwipeDistance?: number;
  };
};

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      ["use:swipe"]?: Props;
    }
  }
}

export function swipe(node: HTMLElement, props: () => Props) {
  let startTime: number;
  let clientX: number;
  let clientY: number;

  function onDown(_: PointerEvent[], event: PointerEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    let timeframe = props().parameters?.timeframe;
    if (timeframe === undefined) timeframe = DEFAULT_DELAY;
    if (activeEvents.length === 0 && Date.now() - startTime < timeframe) {
      const x = event.clientX - clientX;
      const y = event.clientY - clientY;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      let direction: "top" | "right" | "bottom" | "left" | undefined;
      let minSwipeDistance = props().parameters?.minSwipeDistance;
      if (minSwipeDistance === undefined) minSwipeDistance = DEFAULT_MIN_SWIPE_DISTANCE;
      if (absX >= 2 * absY && absX > minSwipeDistance) {
        // horizontal (by *2 we eliminate diagonal movements)
        direction = x > 0 ? "right" : "left";
      } else if (absY >= 2 * absX && absY > minSwipeDistance) {
        // vertical (by *2 we eliminate diagonal movements)
        direction = y > 0 ? "bottom" : "top";
      }
      if (direction) {
        props().callback(direction);
      }
    }
  }

  return registerPointerListener(node, onDown, undefined, onUp);
}
