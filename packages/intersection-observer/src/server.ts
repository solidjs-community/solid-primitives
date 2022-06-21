import * as API from "./index";

export const makeIntersectionObserver: typeof API.makeIntersectionObserver = (
  _elements,
  _onChange,
  _options
) => {
  return {
    add: (_el: Element) => {
      /* void */
    },
    remove: (_el: Element) => {
      /* void */
    },
    start: () => {
      /* void */
    },
    stop: () => {
      /* void */
    },
    reset: () => {
      /* void */
    },
    instance: {} as unknown as IntersectionObserver
  }
}

export const createIntersectionObserver: typeof API.createIntersectionObserver = (
  _elements,
  _onChange,
  _options?
) => {};

export const createViewportObserver: typeof API.createViewportObserver = (...a: any) => {
  return [
    (_: Element) => {
      /* void */
    },
    {
      remove: (_el: Element) => {
        /* void */
      },
      start: () => {
        /* void */
      },
      stop: () => {
        /* void */
      },
      instance: {} as unknown as IntersectionObserver
    }
  ];
}

export const createVisibilityObserver: typeof API.createVisibilityObserver = (
  _element,
  _options
) => {
  return [
    () => false,
    {
      start: () => {
        /* noop */
      },
      stop: () => {
        /* noop */
      },
      instance: {} as unknown as IntersectionObserver
    }
  ];
};
