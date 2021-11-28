import { access, Fn, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, batch, createComputed, createMemo, createSignal, onMount } from "solid-js";
import {
  createMousePosition,
  MouseOptions,
  Position,
  posRelativeToElement,
  RelativeToElementValues
} from ".";
import { isClient, objectOmit } from "./common";

export type RelativeToElement = [
  getters: {
    x: Accessor<number>;
    y: Accessor<number>;
    top: Accessor<number>;
    left: Accessor<number>;
    width: Accessor<number>;
    height: Accessor<number>;
    isInside: Accessor<boolean>;
  },
  update: Fn
];

export type InitialValues = Partial<RelativeToElementValues>;

export interface PositionToElementOptions extends Omit<MouseOptions, "initialValue"> {
  initialValue?: InitialValues;
}

/**
 * Provides an autoupdating position relative to an element. Can be used with existing position signals, or let it get the current cursor position itself.
 *
 * @param element target `Element`
 * @param pos Your existing position values, or `undefined` to capture mouse position automatically
 * @param options
 * @returns Autoupdating position relative to top-left of the target + current bounds of the element.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/mouse#createmousetoelement
 *
 * @example
 * const [{ x, y, top, left, width, height, isInside }, manualUpdate] = createMouseToElement(() => myRef)
 */
export function createMouseToElement(
  element: MaybeAccessor<Element>,
  pos?: Accessor<Position> | { x: MaybeAccessor<number>; y: MaybeAccessor<number> },
  options: PositionToElementOptions = {}
): RelativeToElement {
  const { initialValue = {} } = options;

  let pageX: Accessor<number>;
  let pageY: Accessor<number>;
  if (typeof pos === "function") {
    pageX = () => pos().x;
    pageY = () => pos().y;
  } else if (typeof pos === "object") {
    pageX = typeof pos.x === "function" ? pos.x : () => pos.x as number;
    pageY = typeof pos.y === "function" ? pos.y : () => pos.y as number;
  } else {
    const [mouse] = createMousePosition(objectOmit(options, "initialValue"));
    pageX = mouse.x;
    pageY = mouse.y;
  }

  const [x, setX] = createSignal(initialValue.x ?? 0);
  const [y, setY] = createSignal(initialValue.y ?? 0);
  const [top, setTop] = createSignal(initialValue.top ?? 0);
  const [left, setLeft] = createSignal(initialValue.left ?? 0);
  const [width, setWidth] = createSignal(initialValue.width ?? 0);
  const [height, setHeight] = createSignal(initialValue.height ?? 0);
  const isInside = createMemo(() => x() >= 0 && y() >= 0 && x() <= width() && y() <= height());

  const update = () => {
    const el = access(element);
    if (!el) return;
    const relative = posRelativeToElement(pageX(), pageY(), el);
    batch(() => {
      setX(relative.x);
      setY(relative.y);
      setTop(relative.top);
      setLeft(relative.left);
      setWidth(relative.width);
      setHeight(relative.height);
    });
  };

  if (isClient) onMount(() => createComputed(update));

  return [
    {
      x,
      y,
      top,
      left,
      width,
      height,
      isInside
    },
    update
  ];
}
