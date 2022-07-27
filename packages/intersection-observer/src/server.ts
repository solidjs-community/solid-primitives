import * as API from "./index";
import { noop } from "@solid-primitives/utils";

export { Occurrence, DirectionX, DirectionY } from ".";

export const makeIntersectionObserver: typeof API.makeIntersectionObserver = () => ({
  add: noop,
  remove: noop,
  start: noop,
  stop: noop,
  reset: noop,
  instance: {} as unknown as IntersectionObserver
});

export const createIntersectionObserver: typeof API.createIntersectionObserver = noop;

export const createViewportObserver: typeof API.createViewportObserver = () => [
  noop,
  {
    remove: noop,
    start: noop,
    stop: noop,
    instance: {} as unknown as IntersectionObserver
  }
];

export const createVisibilityObserver: typeof API.createVisibilityObserver = () => () => () =>
  false;

export const getOccurrence: typeof API.getOccurrence = () => API.Occurrence.Outside;

export const getDirection: typeof API.getDirection = () => ({
  directionY: API.DirectionY.None,
  directionX: API.DirectionX.None
});

export const withOccurrence: typeof API.withOccurrence = () => () => () => false;
export const withDirection: typeof API.withDirection = () => () => () => false;
