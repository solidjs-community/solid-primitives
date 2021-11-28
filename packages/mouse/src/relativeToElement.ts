import { access, Fn, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, batch, createComputed, createMemo, createSignal, onMount } from "solid-js";
import { createMousePosition, Position } from ".";
import { isClient } from "./common";

export type RelativeToElement = {
  x: Accessor<number>;
  y: Accessor<number>;
  top: Accessor<number>;
  left: Accessor<number>;
  width: Accessor<number>;
  height: Accessor<number>;
  isInside: Accessor<boolean>;
  update: Fn;
};

export type InitialValues = {
  x?: number;
  y?: number;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
};

export function createRelativeToElement(
  element: MaybeAccessor<Element>,
  x: MaybeAccessor<number>,
  y: MaybeAccessor<number>,
  initialValues?: InitialValues
): RelativeToElement;

export function createRelativeToElement(
  element: MaybeAccessor<Element>,
  position?: MaybeAccessor<Position>,
  initialValues?: InitialValues
): RelativeToElement;

export function createRelativeToElement(
  element: MaybeAccessor<Element>,
  a?: MaybeAccessor<number> | MaybeAccessor<Position>,
  b?: MaybeAccessor<number> | InitialValues,
  c?: InitialValues
): RelativeToElement {
  let pageX: Accessor<number>;
  let pageY: Accessor<number>;
  let initialValues: InitialValues = {};
  if (typeof b === "function" || typeof b === "number") {
    // overload 1.
    pageX = () => access(a as MaybeAccessor<number>);
    pageY = () => access(b);
    if (c) initialValues = c;
  } else if (typeof a !== "undefined") {
    // overload 2. - with position provided
    const pos = a as MaybeAccessor<Position>;
    pageX = () => access(pos).x;
    pageY = () => access(pos).y;
    if (b) initialValues = b;
  } else {
    // overload 2. - create mouse position internally
    const mouse = createMousePosition();
    pageX = mouse.x;
    pageY = mouse.y;
  }

  const [x, setX] = createSignal(initialValues.x ?? 0);
  const [y, setY] = createSignal(initialValues.y ?? 0);
  const [top, setTop] = createSignal(initialValues.top ?? 0);
  const [left, setLeft] = createSignal(initialValues.left ?? 0);
  const [width, setWidth] = createSignal(initialValues.width ?? 0);
  const [height, setHeight] = createSignal(initialValues.height ?? 0);
  const isInside = createMemo(() => x() >= 0 && y() >= 0 && x() <= width() && y() <= height());

  const update = () => {
    const el = access(element);
    if (!el) return;
    const bounds = el.getBoundingClientRect(),
      top = bounds.top + window.pageYOffset,
      left = bounds.left + window.pageXOffset;
    batch(() => {
      setX(pageX() - left);
      setY(pageY() - top);
      setTop(top);
      setLeft(left);
      setWidth(bounds.width);
      setHeight(bounds.height);
    });
  };

  if (isClient) onMount(() => createComputed(update));

  return {
    x,
    y,
    top,
    left,
    width,
    height,
    isInside,
    update
  };
}
