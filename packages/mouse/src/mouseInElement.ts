import { access, createCallbackStack, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createComputed, createSignal, onMount } from "solid-js";
import { MouseOptions, MouseSourceType } from ".";
import { addListener } from "./common";

/**
 * Listens to mouse (and touch) events inside the element.
 *
 * @param element target element *— if passed as a signal, will update on change*
 * @param options
 * @returns Autoupdating position of cursor inside the element; source of the last cursor movement
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/mouse#createmouseinelement
 *
 * @example
 * const [{ x, y, sourceType, isInside }, { stop, start }] = createMouseInElement(() => myRef, { followTouch: false })
 */
export function createMouseInElement(
  element: MaybeAccessor<HTMLElement>,
  options: MouseOptions = {}
): [
  getters: {
    x: Accessor<number>;
    y: Accessor<number>;
    sourceType: Accessor<MouseSourceType>;
    isInside: Accessor<boolean>;
  },
  clear: VoidFunction
] {
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

  const toCleanup = createCallbackStack();
  const start = (el: HTMLElement = access(element)) => {
    toCleanup.execute();
    if (!el) return;
    toCleanup.push(
      addListener(el, "mouseover", () => setIsInside(true)),
      addListener(el, "mouseout", () => setIsInside(false)),
      addListener(el, "mousemove", e => handleMouseMove(e, el))
    );
    if (touch) {
      toCleanup.push(
        addListener(el, "touchstart", e => {
          setIsInside(true);
          handleTouchMove(e, el);
        }),
        addListener(el, "touchend", () => setIsInside(false))
      );
      if (followTouch) toCleanup.push(addListener(el, "touchmove", e => handleTouchMove(e, el)));
    }
  };

  access(element) ? createComputed(() => start()) : onMount(() => createComputed(() => start()));

  return [
    {
      x,
      y,
      sourceType,
      isInside
    },
    toCleanup.execute
  ];
}
