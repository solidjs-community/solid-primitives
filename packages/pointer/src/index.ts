import { ClearListeners, createEventListener } from "@solid-primitives/event-listener";
import {
  Get,
  MaybeAccessor,
  forEachEntry,
  includes,
  createCallbackStack
} from "@solid-primitives/utils";
import { pick, split } from "@solid-primitives/immutable";
import { Accessor, createSignal } from "solid-js";

export type PointerType = "mouse" | "touch" | "pen";

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

const parseOnEventName = <T extends string>(name: T) =>
  name.substring(2).toLowerCase() as ReverseOnEventName<T>;
const parseEventHandlers = <H extends Record<AnyOnEventName, Get<any>>>(
  handlers: H
): ParsedEventHandlers<H> => {
  const result = {} as any;
  Object.entries(handlers).forEach(([name, fn]) => (result[parseOnEventName(name)] = fn));
  return result;
};

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

export function createPointerPosition(
  config: {
    target?: MaybeAccessor<Window | Document | HTMLElement>;
    pointerTypes?: PointerType[];
    value?: PointerState;
  } = {}
): Accessor<PointerState> {
  const [state, setState] = createSignal<any>(config.value ?? defaultState);
  const handler = (e: PointerEvent, active = true) =>
    setState({ ...pick(e, ...pointerStateKeys), active });
  createPointerListener({
    target: config.target,
    pointerTypes: config.pointerTypes,
    onstart: handler,
    onMove: handler,
    onend: e => handler(e, false)
  });
  return state;
}
