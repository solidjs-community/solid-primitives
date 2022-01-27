import { ClearListeners, createEventListener } from "@solid-primitives/event-listener";
import {
  Get,
  MaybeAccessor,
  forEachEntry,
  includes,
  createCallbackStack,
  Directive
} from "@solid-primitives/utils";
import { pick, split } from "@solid-primitives/immutable";
import { Accessor, createSignal, JSX } from "solid-js";

export type PointerType = "mouse" | "touch" | "pen";

export type Position = {
  x: number;
  y: number;
};

type PointerEventNames =
  | "over"
  | "enter"
  | "down"
  | "move"
  | "up"
  | "cancel"
  | "out"
  | "leave"
  | "gotCapture"
  | "lostCapture";

type OnEventName<T extends string> = `on${Lowercase<T>}` | `on${Capitalize<T>}`;

type OnPointerEventNames = OnEventName<PointerEventNames>;

type Handlers = Partial<
  Record<OnPointerEventNames, Get<PointerEvent>> &
    Record<OnEventName<"end" | "start">, Get<PointerEvent>>
>;

type AnyOnEventName = `on${string}`;
type ReverseOnEventName<T> = T extends string
  ? Lowercase<T extends `on${infer K}` ? K : `${T}`>
  : never;
type ParsedEventHandlers<H extends Record<AnyOnEventName, Get<any>>> = {
  [K in ReverseOnEventName<keyof H>]: H[`on${K}`];
};

export type PointerState = {
  active: boolean;
  pressure: number;
  pointerId: number;
  tiltX: number;
  tiltY: number;
  width: number;
  height: number;
  twist: number;
  pointerType: PointerType | null;
  x: number;
  y: number;
};

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      pointerPosition: PointerPositionDirectiveProps;
      pointerHover: PointerHoverDirectiveProps;
    }
  }
}
export type E = JSX.Element;

type PointerPositionDirectiveHandler = (poz: PointerState, el: Element) => void;
type PointerPositionDirectiveProps =
  | PointerPositionDirectiveHandler
  | { pointerTypes?: PointerType[]; handler: PointerPositionDirectiveHandler };
type PointerHoverDirectiveHandler = (hovering: boolean, el: Element) => void;
type PointerHoverDirectiveProps =
  | PointerHoverDirectiveHandler
  | { pointerTypes?: PointerType[]; handler: PointerHoverDirectiveHandler };

const parseOnEventName = <T extends string>(name: T) =>
  name.substring(2).toLowerCase() as ReverseOnEventName<T>;
const parseEventHandlers = <H extends Record<AnyOnEventName, Get<any>>>(
  handlers: H
): ParsedEventHandlers<H> => {
  const result = {} as any;
  Object.entries(handlers).forEach(([name, fn]) => (result[parseOnEventName(name)] = fn));
  return result;
};

// TODO: possible helpers for managing multiple pointers?

/**
 * Setups event listeners for pointer events, that will get automatically removed on cleanup.
 * @param config event handlers, target, and chosen pointer types
 * - `target` - specify the target to attach the listeners to. Will default to `document.body`
 * - `pointerTypes` - specify array of pointer types you want to listen to. By default listens to `["mouse", "touch", "pen"]`
 * - your event handlers: e.g. `onstart`, `onend`, `onMove`, ...
 * @returns function stopping currently attached listener
 *
 * @example
 * createPointerListener({
 *    // pass a function if the element has to mount
 *    target: () => el,
 *    pointerTypes: ["touch"],
 *    onStart: e => console.log("start", e.x, e.y),
 *    onMove: e => console.log({ x: e.x, y: e.y }),
 *    onend: e => console.log("end", e.x, e.y),
 *    onLostCapture: e => console.log("lost")
 * });
 */
export function createPointerListener(
  config: Handlers & {
    target?: MaybeAccessor<Window | Document | HTMLElement>;
    pointerTypes?: PointerType[];
  }
): ClearListeners {
  const [{ target = document.body, pointerTypes }, handlers] = split(
    config,
    "target",
    "pointerTypes"
  );
  const [
    { start: onStart, end: onEnd, gotcapture: onGotCapture, lostcapture: onLostCapture },
    nativeHandlers
  ] = split(parseEventHandlers(handlers), "start", "end", "gotcapture", "lostcapture");

  const runHandler = (handler: Get<PointerEvent>) => (event: PointerEvent) =>
    (!pointerTypes || includes(pointerTypes, event.pointerType)) && handler(event);

  const cleanup = createCallbackStack();

  forEachEntry(nativeHandlers, (name, fn) => {
    if (!fn) return;
    cleanup.push(createEventListener(target, `pointer${name}`, runHandler(fn), { passive: true }));
  });

  // prettier-ignore
  if (onStart) cleanup.push(createEventListener(
    target,
    ["pointerenter", "pointerdown"],
    runHandler(e => {
      if (e.type === "pointerdown" && e.pointerType === "touch") onStart(e);
      else if (e.type === "pointerenter" && e.pointerType === "mouse") onStart(e);
    }),
    { passive: true }
  ));

  // prettier-ignore
  if (onEnd) cleanup.push(createEventListener(
    target,
    ["pointerleave", "pointerup"],
    runHandler(e => {
      if (e.type === "pointerup" && e.pointerType === "touch") onEnd(e);
      else if (e.type === "pointerleave" && e.pointerType === "mouse") onEnd(e);
    }),
    { passive: true }
  ));

  if (onGotCapture)
    cleanup.push(
      createEventListener(target, "gotpointercapture", runHandler(onGotCapture), { passive: true })
    );
  if (onLostCapture)
    cleanup.push(
      createEventListener(target, "lostpointercapture", runHandler(onLostCapture), {
        passive: true
      })
    );

  return cleanup.execute;
}

const defaultState: PointerState = {
  x: 0,
  y: 0,
  pointerId: 0,
  pressure: 0,
  tiltX: 0,
  tiltY: 0,
  width: 0,
  height: 0,
  twist: 0,
  pointerType: null,
  active: false
};
const pointerStateKeys: Exclude<keyof PointerState, "active">[] = [
  "x",
  "y",
  "pointerId",
  "pressure",
  "tiltX",
  "tiltY",
  "width",
  "height",
  "twist",
  "pointerType"
];
const getPointerState = (e: PointerEvent, active: boolean) =>
  ({ ...pick(e, ...pointerStateKeys), active } as PointerState);

/**
 * Returns a signal with autoupdating Pointer position.
 * @param config primitive config:
 * - `target` - specify the target to attach the listeners to. Will default to `document.body`
 * - `pointerTypes` - specify array of pointer types you want to listen to. By default listens to `["mouse", "touch", "pen"]`
 * - `value` - set the initial value of the returned signal *(before the first event)*
 * @returns position signal
 *
 * @example
 * const position = createPointerPosition({
 *    target: document.querySelector('my-el'),
 *    pointerTypes: ["touch"]
 * });
 */
export function createPointerPosition(
  config: {
    target?: MaybeAccessor<Window | Document | HTMLElement>;
    pointerTypes?: PointerType[];
    value?: PointerState;
  } = {}
): Accessor<PointerState> {
  const [state, setState] = createSignal<any>(config.value ?? defaultState);
  const handler = (e: PointerEvent, active = true) => setState(getPointerState(e, active));
  createPointerListener({
    target: config.target,
    pointerTypes: config.pointerTypes,
    onstart: handler,
    onMove: handler,
    onend: e => handler(e, false)
  });
  return state;
}

/**
 * A non-reactive helper function. It turns a position relative to the screen/window, to be relative to an element.
 * @param poz object containing `x` & `y`
 * @param el element to calculate the position of
 * @returns the `poz` with `x` and `y` changed, and `isInside` added
 */
export const getPositionToElement = <T extends Position>(
  poz: T,
  el: Element
): T & { isInside: boolean } => {
  const { top, left, width, height } = el.getBoundingClientRect(),
    x = poz.x - left,
    y = poz.y - top;
  return {
    ...poz,
    x,
    y,
    isInside: x >= 0 && y >= 0 && x <= width && y <= height
  };
};

/**
 * A directive for getting pointer position.
 */
export const pointerPosition: Directive<PointerPositionDirectiveProps> = (el, props) => {
  const { pointerTypes, handler } = (() => {
    const v = props();
    return typeof v === "function" ? { handler: v, pointerTypes: undefined } : v;
  })();
  const runHandler = (e: PointerEvent, active = true) => handler(getPointerState(e, active), el);
  createPointerListener({
    target: el as HTMLElement,
    pointerTypes: pointerTypes,
    onstart: runHandler,
    onMove: runHandler,
    onend: e => runHandler(e, false)
  });
};

// TODO: track pointer id's of start & end events, to not disable the hovering state when at least one pointer is still hovering

/**
 * A directive for checking if the element is being hovered by a pointer.
 */
export const pointerHover: Directive<PointerHoverDirectiveProps> = (el, props) => {
  const { pointerTypes, handler } = (() => {
    const v = props();
    return typeof v === "function" ? { handler: v, pointerTypes: undefined } : v;
  })();
  createPointerListener({
    target: el as HTMLElement,
    pointerTypes: pointerTypes,
    onstart: () => handler(true, el),
    onend: () => handler(false, el)
  });
};
