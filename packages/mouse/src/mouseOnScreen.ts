import { Fn } from "@solid-primitives/utils";
import { Accessor, createMemo, createSignal } from "solid-js";
import { addListener, isClient } from "./common";

export interface MouseOnScreenOptions {
  /**
   * Listen to touch events
   *
   * @default true
   */
  touch?: boolean;

  /**
   * Initial value
   *
   * @default false
   */
  initialValue?: boolean;
}

/**
 * Is cursor on screen?
 *
 * @param options -
 * - touch - *Listen to touch events*
 * - initialValue
 *
 * @example
 * const isMouseOnScreen = createMouseOnScreen(true)
 */
export function createMouseOnScreen(initialValue?: boolean): Accessor<boolean>;
export function createMouseOnScreen(options?: MouseOnScreenOptions): Accessor<boolean>;
export function createMouseOnScreen(a: MouseOnScreenOptions | boolean = {}) {
  let touch: boolean;
  let initialValue: boolean;
  if (typeof a === "object") {
    touch = a?.touch ?? true;
    initialValue = a?.initialValue ?? false;
  } else {
    touch = true;
    initialValue = a ?? null;
  }
  const [mouseOnScreen, setMouseOnScreen] = createSignal<boolean>(initialValue);
  const [touchOnScreen, setTouchOnScreen] = createSignal(touch ? initialValue : false);

  const onScreen = createMemo(
    touch ? () => mouseOnScreen() || touchOnScreen() : () => mouseOnScreen()
  );

  let cleanupList: Fn[] = [];
  const start = () => {
    stop();
    if (isClient) {
      cleanupList.push(addListener(document, "mouseenter", () => setMouseOnScreen(true)));
      cleanupList.push(addListener(document, "mouseleave", () => setMouseOnScreen(false)));
      if (touch) {
        cleanupList.push(addListener(window, "mouseenter", () => setTouchOnScreen(true)));
        cleanupList.push(addListener(window, "mouseleave", () => setTouchOnScreen(false)));
      }
    }
  };
  const stop = () => {
    cleanupList.forEach(fn => fn());
    cleanupList = [];
  };
  start();

  return onScreen;
}
