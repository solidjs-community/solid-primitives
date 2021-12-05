import { Accessor } from "solid-js";

import {
  AddIntersectionObserverEntry,
  AddViewportObserverEntry,
  CreateViewportObserverReturnValue,
  EntryCallback,
  MaybeAccessor,
  RemoveIntersectionObserverEntry,
  RemoveViewportObserverEntry
} from "./index";

export {
  AddIntersectionObserverEntry,
  AddViewportObserverEntry,
  CreateViewportObserverReturnValue,
  EntryCallback,
  MaybeAccessor,
  RemoveIntersectionObserverEntry,
  RemoveViewportObserverEntry
};

export const createIntersectionObserver = (
  _elements: MaybeAccessor<Element[]>,
  _onChange: IntersectionObserverCallback,
  _options?: IntersectionObserverInit
): [
  AddIntersectionObserverEntry,
  {
    remove: RemoveIntersectionObserverEntry;
    start: () => void;
    stop: () => void;
    instance: IntersectionObserver;
  }
] => [
  _el => {
    /* noop */
  },
  {
    remove: _el => {
      /* noop */
    },
    start: () => {
      /* noop */
    },
    stop: () => {
      /* noop */
    },
    instance: {} as unknown as IntersectionObserver
  }
];

export function createViewportObserver(
  elements: MaybeAccessor<Element[]>,
  callback: EntryCallback,
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  initial: MaybeAccessor<[Element, EntryCallback][]>,
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;

export function createViewportObserver(...a: any): CreateViewportObserverReturnValue {
  return [
    (_el: Element) => {
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

export const createVisibilityObserver = (
  _element: MaybeAccessor<Element>,
  _options?: IntersectionObserverInit & {
    initialValue?: boolean;
    once?: boolean;
  }
): [Accessor<boolean>, { start: () => void; stop: () => void; instance: IntersectionObserver }] => {
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
