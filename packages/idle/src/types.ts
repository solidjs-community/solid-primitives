import { Accessor } from "solid-js";

export type EventTypeName = keyof HTMLElementEventMap | keyof DocumentEventMap;

export interface IdleTimerOptions {
  events?: EventTypeName[];
  element?: HTMLElement;
  idleTimeout?: number;
  promptTimeout?: number;
  startManually?: boolean;
  onIdle?: (lastEvt: Event) => void;
  onActive?: (activyEvt: Event) => void;
  onPrompt?: (promptEvt: Event) => void;
}

export interface IdleTimerReturn {
  isIdle: Accessor<boolean>;
  isPrompted: Accessor<boolean>;
  reset: () => void;
  start: () => void;
  stop: () => void;
}
