import { access, Fn, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createEffect, createSignal, onMount } from "solid-js";
import { MouseOptions, MouseSourceType } from ".";
import { addListener, isClient } from "./common";

/**
 * Listens to mouse (and touch) events inside the element.
 *
 * @param element target element *— if passed as a signal, will update on change*
 * @param options
 * @returns Autoupdating position of cursor inside the element; source of the last cursor movement
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/mouse#createmouseinelement
 *
 * @example
 * const { x, y, sourceType, isInside } = createMouseInElement(() => myRef, { touch: true })
 */
export function createMouseInElement(
  element: MaybeAccessor<HTMLElement>,
  options: MouseOptions = {}
): {
  x: Accessor<number>;
  y: Accessor<number>;
  sourceType: Accessor<MouseSourceType>;
  isInside: Accessor<boolean>;
} {
  const { touch = true, followTouch = true, initialValue = { x: 0, y: 0 } } = options;
  const [x, setX] = createSignal(initialValue.x);
  const [y, setY] = createSignal(initialValue.y);
  const [sourceType, setSourceType] = createSignal<MouseSourceType>(null);
  const [isInside, setIsInside] = createSignal(false);

  const handleMouseMove = (e: MouseEvent, el: HTMLElement) => {
    const { top, left } = el.getBoundingClientRect();
    setX(e.pageX - left - window.pageXOffset);
    setY(e.pageY - top - window.pageYOffset);
    setSourceType("mouse");
  };
  const handleTouchMove = (e: TouchEvent, el: HTMLElement) => {
    const { top, left } = el.getBoundingClientRect();
    if (!e.touches.length) return;
    setX(e.touches[0].clientX - left - window.pageXOffset);
    setY(e.touches[0].clientY - top - window.pageYOffset);
    setSourceType("touch");
  };

  let cleanupList: Fn[] = [];
  const start = (el: HTMLElement) => {
    stop();
    if (isClient) {
      cleanupList.push(
        addListener(el, "mouseover", () => setIsInside(true)),
        addListener(el, "mouseout", () => setIsInside(false)),
        addListener(el, "mousemove", e => handleMouseMove(e, el))
      );
      if (touch) {
        cleanupList.push(
          addListener(el, "touchstart", e => {
            setIsInside(true);
            handleTouchMove(e, el);
          }),
          addListener(el, "touchend", () => setIsInside(false))
        );
        if (followTouch)
          cleanupList.push(addListener(el, "touchmove", e => handleTouchMove(e, el)));
      }
    }
  };
  const stop = () => {
    cleanupList.forEach(fn => fn());
    cleanupList = [];
  };

  const setup = () => createEffect(() => start(access(element)));
  if (access(element)) setup();
  else onMount(setup);

  return {
    x,
    y,
    sourceType,
    isInside
  };
}
