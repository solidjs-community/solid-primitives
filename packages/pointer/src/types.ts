import { Get } from "@solid-primitives/utils";
import { JSX } from "solid-js";

export type PointerType = "mouse" | "touch" | "pen";
export type EventTarget = Window | Document | HTMLElement;

export type PointerEventNames =
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

export type OnEventName<T extends string> = `on${Lowercase<T>}` | `on${Capitalize<T>}`;

export type OnEventRecord<T extends string, V> = Record<OnEventName<T>, V>;
export type Handler = Get<PointerEvent>;

export type AnyOnEventName = `on${string}`;
export type ReverseOnEventName<T> = T extends string
  ? Lowercase<T extends `on${infer K}` ? K : `${T}`>
  : never;
export type ParsedEventHandlers<H extends Record<AnyOnEventName, Get<any>>> = {
  [K in ReverseOnEventName<keyof H>]: H[`on${K}`];
};

export type PointerState = {
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

export type PointerStateWithActive = PointerState & { isActive: boolean };

export type PointerListItem = PointerState & { isDown: boolean };

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      pointerHover: PointerHoverDirectiveProps;
    }
  }
}
export type E = JSX.Element;

export type PointerPositionDirectiveHandler = (state: PointerStateWithActive, el: Element) => void;
export type PointerPositionDirectiveProps =
  | PointerPositionDirectiveHandler
  | {
      pointerTypes?: PointerType[];
      handler: PointerPositionDirectiveHandler;
    };

export type PointerHoverDirectiveHandler = (hovering: boolean, el: Element) => void;
export type PointerHoverDirectiveProps =
  | PointerHoverDirectiveHandler
  | { pointerTypes?: PointerType[]; handler: PointerHoverDirectiveHandler };
