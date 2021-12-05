import { Fn, isClient } from "@solid-primitives/utils";
import { Accessor, createMemo, createSignal } from "solid-js";
import { addListener } from "./common";

export interface MouseOnScreenOptions {
  /**
   * Listen to touch events
   * @default true
   */
  touch?: boolean;
  /**
   * Initial value
   * @default false
   */
  initialValue?: boolean;
}

/**
 * *Is the cursor on screen?*
 *
 * @param options -
 * - touch - *Listen to touch events*
 * - initialValue
 *
 * @example
 * const [isMouseOnScreen, { start, stop }] = createMouseOnScreen(true);
 */
export function createMouseOnScreen(
  initialValue?: boolean
): [onScreen: Accessor<boolean>, actions: { stop: Fn; start: Fn }];
export function createMouseOnScreen(
  options?: MouseOnScreenOptions
): [onScreen: Accessor<boolean>, actions: { stop: Fn; start: Fn }];
export function createMouseOnScreen(
  a: MouseOnScreenOptions | boolean = {}
): [onScreen: Accessor<boolean>, actions: { stop: Fn; start: Fn }] {
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
      cleanupList.push(
        addListener(document, "mouseenter", () => setMouseOnScreen(true)),
        // mousemove with once is for the situations where the cursor has entered the screen before the listeners could attach
        addListener(document, "mousemove", () => setMouseOnScreen(true), {
          passive: true,
          once: true
        }),
        addListener(document, "mouseleave", () => setMouseOnScreen(false))
      );
      if (touch)
        cleanupList.push(
          addListener(window, "touchstart", () => setTouchOnScreen(true)),
          addListener(window, "touchend", () => setTouchOnScreen(false))
        );
    }
  };
  const stop = () => {
    cleanupList.forEach(fn => fn());
    cleanupList = [];
  };
  start();

  return [onScreen, { start, stop }];
}
