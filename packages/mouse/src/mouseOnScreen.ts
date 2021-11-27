import { Accessor, createMemo, createSignal, onCleanup } from "solid-js";

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

  const handleEnter = () => setMouseOnScreen(true);
  const handleLeave = () => setMouseOnScreen(false);
  const handleStart = () => setTouchOnScreen(true);
  const handleEnd = () => setTouchOnScreen(false);

  if (document && "addEventListener" in document) {
    document.addEventListener("mouseenter", handleEnter);
    document.addEventListener("mouseleave", handleLeave);

    if (touch) {
      addEventListener("touchstart", handleStart);
      addEventListener("touchend", handleEnd);
    }

    onCleanup(() => {
      document.removeEventListener("mouseenter", handleEnter);
      document.removeEventListener("mouseleave", handleLeave);
      removeEventListener("touchstart", handleStart);
      removeEventListener("touchend", handleEnd);
    });
  }

  return onScreen;
}
