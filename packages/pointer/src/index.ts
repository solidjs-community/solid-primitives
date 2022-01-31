import { ClearListeners, createEventListener } from "@solid-primitives/event-listener";
import {
  Get,
  MaybeAccessor,
  forEachEntry,
  includes,
  createCallbackStack,
  Directive,
  Many,
  Clear,
  createProxy,
  warn
} from "@solid-primitives/utils";
import { pick, split } from "@solid-primitives/immutable";
import { Accessor, createSignal, getOwner, JSX } from "solid-js";
import { createSubRoot } from "@solid-primitives/rootless";

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

type PointerHandlers = Partial<OnEventRecord<PointerEventNames, Handler>>;
type OnEventRecord<T extends string, V> = Record<OnEventName<T>, V>;
type Handler = Get<PointerEvent>;

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
const parseEventHandlers = <H extends Record<AnyOnEventName, any>>(
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
 * createPointerListeners({
 *    // pass a function if the element has to mount
 *    target: () => el,
 *    pointerTypes: ["touch"],
 *    onStart: e => console.log("start", e.x, e.y),
 *    onMove: e => console.log({ x: e.x, y: e.y }),
 *    onend: e => console.log("end", e.x, e.y),
 *    onLostCapture: e => console.log("lost")
 * });
 */
export function createPointerListeners(
  config: PointerHandlers & {
    target?: MaybeAccessor<Window | Document | HTMLElement>;
    pointerTypes?: PointerType[];
    passive?: boolean;
  }
): ClearListeners {
  const [{ target = document.body, pointerTypes, passive = true }, handlers] = split(
    config,
    "target",
    "pointerTypes",
    "passive"
  );
  const [{ gotcapture: onGotCapture, lostcapture: onLostCapture }, nativeHandlers] = split(
    parseEventHandlers(handlers),
    "gotcapture",
    "lostcapture"
  );

  const guardCB = (handler: Handler) => (event: PointerEvent) =>
    (!pointerTypes || includes(pointerTypes, event.pointerType)) && handler(event);
  const cleanup = createCallbackStack();
  const addEventListener = (type: Many<keyof HTMLElementEventMap>, fn: Handler) =>
    cleanup.push(createEventListener(target, type, guardCB(fn) as any, { passive }));

  forEachEntry(nativeHandlers, (name, fn) => fn && addEventListener(`pointer${name}`, fn));
  if (onGotCapture) addEventListener("gotpointercapture", onGotCapture);
  if (onLostCapture) addEventListener("lostpointercapture", onLostCapture);

  return cleanup.execute;
}

export function createPerPointerListeners(
  config: {
    target?: MaybeAccessor<HTMLElement>;
    pointerTypes?: PointerType[];
    passive?: boolean;
  } & Partial<
    OnEventRecord<
      "enter",
      (
        event: PointerEvent,
        handlers: Readonly<OnEventRecord<"down" | "move" | "up" | "leave" | "cancel", Get<Handler>>>
      ) => void
    > &
      OnEventRecord<"down", (event: PointerEvent, onMove: Get<Handler>, onUp: Get<Handler>) => void>
  >
) {
  const [{ target = document.body, pointerTypes, passive = true }, handlers] = split(
    config,
    "pointerTypes",
    "target",
    "passive"
  );
  const { down: onDown, enter: onEnter } = parseEventHandlers(handlers);
  const owner = getOwner();
  const onlyInitMessage = "All listeners need to be added synchronously in the initial event.";
  const addListener = (type: Many<string>, fn: Handler, pointerId?: number): Clear =>
    createEventListener(
      target,
      type,
      ((e: PointerEvent) =>
        (!pointerTypes || includes(pointerTypes, e.pointerType)) &&
        (!pointerId || e.pointerId === pointerId) &&
        fn(e)) as any,
      { passive }
    );

  if (onEnter) {
    const handleEnter = (e: PointerEvent) => {
      createSubRoot(dispose => {
        const { pointerId } = e;
        let init = true;
        let onLeave: Handler | undefined;

        addListener(
          "pointerleave",
          e => {
            onLeave?.(e);
            dispose();
          },
          pointerId
        );

        onEnter(
          e,
          createProxy({
            get(key) {
              const type = "pointer" + key.substring(2).toLowerCase();
              return fn => {
                if (!init) return warn(onlyInitMessage);
                if (type === "pointerleave") onLeave = fn;
                else addListener(type, fn, pointerId);
              };
            }
          })
        );
        init = false;
      }, owner);
    };
    addListener("pointerenter", handleEnter);
  }

  if (onDown) {
    const handleDown = (e: PointerEvent) => {
      createSubRoot(dispose => {
        const { pointerId } = e;
        let init = true;
        let onUp: Handler | undefined;

        addListener(
          ["pointerup", "pointercancel"],
          e => {
            onUp?.(e);
            dispose();
          },
          pointerId
        );

        onDown(
          e,
          // onMove()
          fn => {
            if (init) addListener("pointermove", fn, pointerId);
            else warn(onlyInitMessage);
          },
          // onUp()
          fn => {
            if (init) onUp = fn;
            else warn(onlyInitMessage);
          }
        );
        init = false;
      }, owner);
    };
    addListener("pointerdown", handleDown);
  }
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
  createPointerListeners({
    target: config.target,
    pointerTypes: config.pointerTypes,
    onEnter: e => handler(e),
    onMove: e => handler(e),
    onLeave: e => handler(e, false)
  });
  return state;
}

// TODO: pointer list primitive returning a dynamic array of active touch points

export function createPointerList() {}

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
  createPointerListeners({
    target: el as HTMLElement,
    pointerTypes: pointerTypes,
    onEnter: e => runHandler(e),
    onMove: runHandler,
    onLeave: e => runHandler(e, false)
  });
};

/**
 * A directive for checking if the element is being hovered by a pointer.
 */
export const pointerHover: Directive<PointerHoverDirectiveProps> = (el, props) => {
  const { pointerTypes, handler } = (() => {
    const v = props();
    return typeof v === "function" ? { handler: v, pointerTypes: undefined } : v;
  })();
  const pointers = new Set<number>();
  createPointerListeners({
    target: el as HTMLElement,
    pointerTypes: pointerTypes,
    onEnter: e => {
      pointers.add(e.pointerId);
      handler(true, el);
    },
    onLeave: e => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) handler(false, el);
    }
  });
};
