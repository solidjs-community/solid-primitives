import { Accessor, batch, createSignal } from "solid-js";
import { addListener, isClient } from "./common";

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

export function createMousePosition(options: MouseOptions = {}): {
  x: Accessor<number>;
  y: Accessor<number>;
  sourceType: Accessor<MouseSourceType>;
} {
  const { touch = true, initialValue = { x: 0, y: 0 } } = options;

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
    addListener(window, "mousemove", mouseHandler, { passive: true });
    addListener(window, "dragover", mouseHandler, { passive: true });
    if (touch) {
      addListener(window, "touchstart", touchHandler, { passive: true });
      addListener(window, "touchmove", touchHandler, { passive: true });
    }
  }

  return {
    x,
    y,
    sourceType
  };
}
