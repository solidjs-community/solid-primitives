import { access, Fn, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, batch, createComputed, createMemo, createSignal, onMount } from "solid-js";
import { Position } from ".";
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

export type FallbackValues = {
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
  fallback?: FallbackValues
): RelativeToElement;

export function createRelativeToElement(
  element: MaybeAccessor<Element>,
  pos: MaybeAccessor<Position>,
  fallback?: FallbackValues
): RelativeToElement;

export function createRelativeToElement(
  element: MaybeAccessor<Element>,
  a: MaybeAccessor<number> | MaybeAccessor<Position>,
  b?: MaybeAccessor<number> | FallbackValues,
  c?: FallbackValues
): RelativeToElement {
  let pageX: Accessor<number>;
  let pageY: Accessor<number>;
  let fallback: FallbackValues = {};
  if (typeof b === "function" || typeof b === "number") {
    pageX = () => access(a as MaybeAccessor<number>);
    pageY = () => access(b);
    if (c) fallback = c;
  } else {
    const pos = a as MaybeAccessor<Position>;
    pageX = () => access(pos).x;
    pageY = () => access(pos).y;
    if (b) fallback = b;
  }

  const [x, setX] = createSignal(fallback.x ?? 0);
  const [y, setY] = createSignal(fallback.y ?? 0);
  const [top, setTop] = createSignal(fallback.top ?? 0);
  const [left, setLeft] = createSignal(fallback.left ?? 0);
  const [width, setWidth] = createSignal(fallback.width ?? 0);
  const [height, setHeight] = createSignal(fallback.height ?? 0);
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

  if (isClient) {
    onMount(() => {
      createComputed(update);
    });
  }

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
