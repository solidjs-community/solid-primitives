import { access, Fn, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, batch, createEffect, createSignal, on, onMount } from "solid-js";
import { MouseOptions, MouseSourceType } from ".";
import { addListener, isClient } from "./common";

export function createMouseInElement(
  element: MaybeAccessor<HTMLElement>,
  options: MouseOptions = {}
): {
  x: Accessor<number>;
  y: Accessor<number>;
  sourceType: Accessor<MouseSourceType>;
  isInside: Accessor<boolean>;
} {
  const listenerOptions = { passive: true };
  const { touch = true, initialValue = { x: 0, y: 0 } } = options;
  const [x, setX] = createSignal(initialValue.x);
  const [y, setY] = createSignal(initialValue.y);
  const [sourceType, setSourceType] = createSignal<MouseSourceType>(null);
  const [isInside, setIsInside] = createSignal(false);

  const handleMouseMove = (e: MouseEvent, el: HTMLElement) => {
    const { top, left } = el.getBoundingClientRect();
    batch(() => {
      setX(e.pageX - left - window.pageXOffset);
      setY(e.pageY - top - window.pageYOffset);
      setSourceType("mouse");
    });
  };
  const handleTouchMove = (e: TouchEvent, el: HTMLElement) => {
    const { top, left } = el.getBoundingClientRect();
    batch(() => {
      if (!e.touches.length) return;
      setX(e.touches[0].clientX - left - window.pageXOffset);
      setY(e.touches[0].clientY - top - window.pageYOffset);
      setSourceType("touch");
    });
  };

  if (isClient) {
    const setup = () =>
      createEffect(
        on(
          () => access(element),
          (el, p, toCleanup: Fn[] = []) => {
            toCleanup.forEach(fn => fn());
            if (!el) return [];
            const fnList = [
              addListener(el, "mouseover", () => setIsInside(true), listenerOptions),
              addListener(el, "mouseout", () => setIsInside(false), listenerOptions),
              addListener(el, "mousemove", e => handleMouseMove(e, el), listenerOptions)
            ];
            if (touch)
              fnList.push(
                addListener(el, "touchstart", () => setIsInside(true), listenerOptions),
                addListener(el, "touchend", () => setIsInside(false), listenerOptions),
                addListener(el, "touchmove", e => handleTouchMove(e, el), listenerOptions)
              );
            return fnList;
          }
        )
      );

    if (access(element)) setup();
    else onMount(setup);
  }

  return {
    x,
    y,
    sourceType,
    isInside
  };
}
