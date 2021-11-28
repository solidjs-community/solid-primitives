import { Fn } from "@solid-primitives/utils";
import { Accessor, batch, createSignal } from "solid-js";
import { Position } from ".";
import { addListener, isClient } from "./common";

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

  /**
   * If enabled, position will be updated on touchmove event.
   *
   * @default true
   */
  followTouch?: boolean;
}

export type MouseSourceType = "mouse" | "touch" | null;

/**
 * Listens to the global mouse events, providing a reactive up-to-date position of the cursor on the page.
 *
 * @param options
 * @returns Accessors for current x & y position, and source of the last cursor movement
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/mouse#createmouseposition
 *
 * @example
 * const [{ x, y, sourceType }, { stop, start }] = createMousePosition({ touch: false })
 */
export function createMousePosition(options: MouseOptions = {}): [
  getters: {
    x: Accessor<number>;
    y: Accessor<number>;
    sourceType: Accessor<MouseSourceType>;
  },
  actions: {
    start: Fn;
    stop: Fn;
  }
] {
  const { touch = true, followTouch = true, initialValue = { x: 0, y: 0 } } = options;

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

  let cleanupList: Fn[] = [];
  const start = () => {
    stop();
    if (isClient) {
      cleanupList.push(addListener(window, "mousemove", mouseHandler));
      cleanupList.push(addListener(window, "dragover", mouseHandler));
      if (touch) {
        cleanupList.push(addListener(window, "touchstart", touchHandler));
        if (followTouch) cleanupList.push(addListener(window, "touchmove", touchHandler));
      }
    }
  };
  const stop = () => {
    cleanupList.forEach(fn => fn());
    cleanupList = [];
  };
  start();

  return [
    {
      x,
      y,
      sourceType
    },
    {
      start,
      stop
    }
  ];
}
