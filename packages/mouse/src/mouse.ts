import { Accessor, batch, createSignal, onCleanup } from "solid-js";
import { isClient } from "./common";

export interface Position {
  x: number;
  y: number;
}

export interface MouseOptions {
  /**
   * Listen to `touchmove` events
   *
   * @default true
   */
  touch?: boolean;

  /**
   * Initial values
   *
   * @default { x:0, y:0 }
   */
  initialValue?: Position;
}

export type MouseSourceType = "mouse" | "touch" | null;

export function createMouse(options: MouseOptions = {}): {
  x: Accessor<number>;
  y: Accessor<number>;
  sourceType: Accessor<MouseSourceType>;
} {
  const { touch = true, initialValue = { x: 0, y: 0 } } = options;
  const listenerOptions = { passive: true };

  const [x, setX] = createSignal(initialValue.x);
  const [y, setY] = createSignal(initialValue.y);
  const [sourceType, setSourceType] = createSignal<MouseSourceType>(null);

  const mouseHandler = (event: MouseEvent) =>
    batch(() => {
      setX(event.pageX);
      setY(event.pageY);
      setSourceType("mouse");
    });

  const touchHandler = (event: TouchEvent) => {
    if (!event.touches.length) return;
    batch(() => {
      setX(event.touches[0].clientX);
      setY(event.touches[0].clientY);
      setSourceType("touch");
    });
  };

  if (isClient) {
    addEventListener("mousemove", mouseHandler, listenerOptions);
    addEventListener("dragover", mouseHandler, listenerOptions);
    // createEventListener(window, "mousemove", mouseHandler, { passive: true });
    // createEventListener(window, "dragover", mouseHandler, { passive: true });
    if (touch) {
      addEventListener("touchstart", touchHandler, listenerOptions);
      addEventListener("touchmove", touchHandler, listenerOptions);
      // createEventListener(window, "touchstart", touchHandler, { passive: true });
      // createEventListener(window, "touchmove", touchHandler, { passive: true });
    }

    onCleanup(() => {
      // @ts-ignore
      removeEventListener("mousemove", mouseHandler, listenerOptions);
      // @ts-ignore
      removeEventListener("dragover", mouseHandler, listenerOptions);
      // @ts-ignore
      removeEventListener("touchstart", touchHandler, listenerOptions);
      // @ts-ignore
      removeEventListener("touchmove", touchHandler, listenerOptions);
    });
  }

  return {
    x,
    y,
    sourceType
  };
}
