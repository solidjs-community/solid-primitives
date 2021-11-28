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

  if (isClient) {
    addListener(document, "mouseenter", () => setMouseOnScreen(true), { passive: true });
    addListener(document, "mouseleave", () => setMouseOnScreen(false), { passive: true });
    if (touch) {
      addListener(window, "mouseenter", () => setTouchOnScreen(true), { passive: true });
      addListener(window, "mouseleave", () => setTouchOnScreen(false), { passive: true });
    }
  }

  return onScreen;
}
