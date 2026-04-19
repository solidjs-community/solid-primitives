import {
  onCleanup,
  createSignal,
  createEffect,
  createStore,
  untrack,
  getOwner,
  runWithOwner,
  DEV,
} from "solid-js";
import type { JSX, Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import {
  access,
  type FalsyValue,
  type MaybeAccessor,
  handleDiffArray,
} from "@solid-primitives/utils";

export type AddIntersectionObserverEntry = (el: Element) => void;
export type RemoveIntersectionObserverEntry = (el: Element) => void;

export type EntryCallback = (
  entry: IntersectionObserverEntry,
  instance: IntersectionObserver,
) => void;
export type AddViewportObserverEntry = (
  el: Element,
  callback: MaybeAccessor<EntryCallback>,
) => void;
export type RemoveViewportObserverEntry = (el: Element) => void;

export type CreateViewportObserverReturnValue = [
  AddViewportObserverEntry,
  {
    remove: RemoveViewportObserverEntry;
    start: () => void;
    stop: () => void;
    instance: IntersectionObserver;
  },
];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      intersectionObserver: true | EntryCallback;
    }
  }
}

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;

function observe(el: Element, instance: IntersectionObserver): void {
  // Elements with 'display: "contents"' don't work with IO, even if they are visible by users
  // (https://github.com/solidjs-community/solid-primitives/issues/116)
  if (DEV && el instanceof HTMLElement && el.style.display === "contents") {
    // eslint-disable-next-line no-console
    console.warn(
      `[@solid-primitives/intersection-observer] IntersectionObserver is not able to observe elements with 'display: "contents"' style:`,
      el,
    );
  }
  instance.observe(el);
}

export function makeIntersectionObserver(
  elements: Element[],
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): {
  add: AddIntersectionObserverEntry;
  remove: RemoveIntersectionObserverEntry;
  start: VoidFunction;
  reset: VoidFunction;
  stop: VoidFunction;
  instance: IntersectionObserver;
} {
  if (isServer)
    return {
      add: () => void 0,
      remove: () => void 0,
      start: () => void 0,
      reset: () => void 0,
      stop: () => void 0,
      instance: {} as unknown as IntersectionObserver,
    };

  const instance = new IntersectionObserver(onChange, options);
  const add: AddIntersectionObserverEntry = el => observe(el, instance);
  const remove: RemoveIntersectionObserverEntry = el => instance.unobserve(el);
  const start = () => elements.forEach(add);
  const reset = () => instance.takeRecords().forEach(el => remove(el.target));
  start();
  return { add, remove, start, stop: onCleanup(() => instance.disconnect()), reset, instance };
}

/**
 * Creates a reactive Intersection Observer primitive. Returns a store array of
 * {@link IntersectionObserverEntry} objects — one slot per element, updated in
 * place whenever that element's intersection state changes. Because the return
 * value is a store, reading `entries[i].isIntersecting` only re-runs the
 * computation that reads it, not every computation that reads the array.
 *
 * @param elements - A reactive list of elements to watch
 * @param options - IntersectionObserver constructor options (may be a reactive
 *   accessor; changing it disconnects and recreates the observer):
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0.
 *
 * @example
 * ```tsx
 * const entries = createIntersectionObserver(elements);
 * createEffect(() => console.log(entries[0]?.isIntersecting));
 * ```
 */
export function createIntersectionObserver(
  elements: Accessor<Element[]>,
  options?: MaybeAccessor<IntersectionObserverInit>,
): readonly IntersectionObserverEntry[] {
  if (isServer) return [];

  const [entries, setEntries] = createStore<IntersectionObserverEntry[]>([]);
  const indexMap = new Map<Element, number>();
  let nextIdx = 0;
  let trackedEls: Element[] = [];

  // Stable callback — never recreated, safe to share across IO instances.
  // Store writes (setEntries) are applied synchronously and do not need
  // runWithOwner — that is only needed for signal writes from external callbacks.
  const ioCallback: IntersectionObserverCallback = newEntries => {
    for (const entry of newEntries) {
      let idx = indexMap.get(entry.target);
      if (idx === undefined) {
        idx = nextIdx++;
        indexMap.set(entry.target, idx);
      }
      // Freeze the entry so Solid's store does not recursively proxy it —
      // isWrappable returns false for frozen objects, which keeps DOM element
      // references (entry.target) unwrapped and referentially stable.
      // Also update length explicitly: Solid 2.0 tracks array length in an
      // override map, so a bare index assignment does not advance it on its own.
      const frozen = Object.freeze({ ...entry });
      setEntries(draft => {
        draft[idx] = frozen as any;
        if (idx >= (draft.length as number)) draft.length = idx + 1;
      });
    }
  };

  // Create the initial IO synchronously so the element effect below can use it
  // immediately on its first deferred run.
  let io = new IntersectionObserver(ioCallback, untrack(() => access(options)));
  onCleanup(() => io.disconnect());

  if (typeof options === "function") {
    // Reactive options: recreate the IO whenever options change and re-observe
    // all currently tracked elements. `io` is a closure variable so the effect
    // always disconnects whichever instance is current before replacing it.
    createEffect(options, (opts: IntersectionObserverInit) => {
      io.disconnect();
      io = new IntersectionObserver(ioCallback, opts);
      trackedEls.forEach(el => observe(el, io));
    });
  }

  createEffect(
    () => elements(),
    (list: Element[], prev: Element[] = []) => {
      handleDiffArray(list, prev, el => observe(el, io), el => io.unobserve(el));
      trackedEls = list;
    },
    [] as Element[],
  );

  return entries;
}

/**
 * Creates a more advanced viewport observer for complex tracking with multiple objects in a single IntersectionObserver instance.
 *
 * @param elements - A list of elements to watch
 * @param callback - Element intersection change event handler
 * @param options - IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 *
 * @example
 * ```tsx
 * const [add, { remove, start, stop, instance }] = createViewportObserver(els, (e) => {...});
 * add(el, e => console.log(e.isIntersecting))
 *
 * // directive usage:
 * const [intersectionObserver] = createViewportObserver()
 * <div use:intersectionObserver={(e) => console.log(e.isIntersecting)}></div>
 * ```
 */
export function createViewportObserver(
  elements: MaybeAccessor<Element[]>,
  callback: EntryCallback,
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  initial: MaybeAccessor<[Element, EntryCallback][]>,
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;

export function createViewportObserver(...a: any) {
  if (isServer) {
    return [() => void 0, { start: () => void 0, stop: () => void 0 }];
  }

  let initial: [Element, EntryCallback][] = [];
  let options: IntersectionObserverInit = {};
  if (Array.isArray(a[0]) || a[0] instanceof Function) {
    if (a[1] instanceof Function) {
      initial = access<Element[]>(a[0]).map(el => [el, a[1]]);
      options = a[2];
    } else {
      initial = access(a[0]);
      options = a[1];
    }
  } else options = a[0];
  const callbacks = new WeakMap<Element, MaybeAccessor<EntryCallback>>();
  const onChange: IntersectionObserverCallback = (entries, instance) =>
    entries.forEach(entry => {
      const cb = callbacks.get(entry.target)?.(entry, instance);
      // Additional check to prevent errors when the user
      // use "observe" directive without providing a callback
      cb instanceof Function && cb(entry, instance);
    });
  const { add, remove, stop, instance } = makeIntersectionObserver([], onChange, options);
  const addEntry: AddViewportObserverEntry = (el, callback) => {
    add(el);
    callbacks.set(el, callback);
  };
  const removeEntry: RemoveViewportObserverEntry = el => {
    callbacks.delete(el);
    remove(el);
  };
  const start = () => initial.forEach(([el, cb]) => addEntry(el, cb));
  // onMount equivalent: run start() once after the reactive scope initialises
  createEffect(() => {}, () => { start(); });
  return [addEntry, { remove: removeEntry, start, stop, instance }];
}

export type VisibilitySetter<Ctx extends {} = {}> = (
  entry: IntersectionObserverEntry,
  context: Ctx & { visible: boolean },
) => boolean;

/**
 * Creates a reactive signal that changes when a single element's visibility changes.
 *
 * Takes the element to observe directly, removing the curried factory pattern of
 * the previous API. The element may be a reactive accessor or a plain DOM element.
 *
 * Signal writes from the IntersectionObserver callback are wrapped in
 * `runWithOwner` to avoid "Signal written to an owned scope" warnings in
 * Solid 2.0 when the IO fires outside the reactive owner.
 *
 * @param element - The element to observe; may be `Accessor<Element | FalsyValue>` or a plain `Element`.
 * @param options - IntersectionObserver constructor options plus `initialValue` for the signal.
 * @param setter - Optional custom setter callback that controls the signal value.
 *
 * @example
 * ```tsx
 * let el: HTMLDivElement | undefined
 * const visible = createVisibilityObserver(() => el, { threshold: 0.8 })
 * <div ref={el}>{ visible() ? "Visible" : "Hidden" }</div>
 * ```
 */
export function createVisibilityObserver(
  element: Accessor<Element | FalsyValue> | Element,
  options?: IntersectionObserverInit & { initialValue?: boolean },
  setter?: MaybeAccessor<VisibilitySetter>,
): Accessor<boolean> {
  if (isServer) return () => options?.initialValue ?? false;

  const owner = getOwner()!;
  const [isVisible, setVisible] = createSignal(options?.initialValue ?? false);

  // access(setter) is called once here — for factory setters like withOccurrence,
  // this creates the per-element closure (with prevIntersecting etc.) exactly once.
  const setterFn = setter ? access(setter) : null;
  const entryCallback: EntryCallback = setterFn
    ? entry => runWithOwner(owner, () => setVisible(setterFn(entry, { visible: untrack(isVisible) })))
    : entry => runWithOwner(owner, () => setVisible(entry.isIntersecting));

  const io = new IntersectionObserver((newEntries, instance) => {
    for (const entry of newEntries) entryCallback(entry, instance);
  }, options);
  onCleanup(() => io.disconnect());

  let prevEl: Element | FalsyValue;

  if (!(element instanceof Element)) {
    createEffect(
      () => element(),
      (el: Element | FalsyValue) => {
        if (el === prevEl) return;
        if (prevEl) { io.unobserve(prevEl); }
        if (el) observe(el, io);
        prevEl = el;
      },
    );
  } else {
    observe(element, io);
    prevEl = element;
  }

  onCleanup(() => { if (prevEl) io.unobserve(prevEl); });

  return isVisible;
}

export enum Occurrence {
  Entering = "Entering",
  Leaving = "Leaving",
  Inside = "Inside",
  Outside = "Outside",
}

/**
 * Calculates the occurrence of an element in the viewport.
 */
export function getOccurrence(
  isIntersecting: boolean,
  prevIsIntersecting: boolean | undefined,
): Occurrence {
  if (isServer) {
    return Occurrence.Outside;
  }
  return isIntersecting
    ? prevIsIntersecting
      ? Occurrence.Inside
      : Occurrence.Entering
    : prevIsIntersecting === true
      ? Occurrence.Leaving
      : Occurrence.Outside;
}

/**
 * A visibility setter factory function. It provides information about element occurrence in the viewport — `"Entering"`, `"Leaving"`, `"Inside"` or `"Outside"`.
 * @param setter - A function that sets the occurrence of an element in the viewport.
 * @returns A visibility setter function.
 * @example
 * ```ts
 * const useVisibilityObserver = createVisibilityObserver(
 *  { threshold: 0.8 },
 *  withOccurrence((entry, { occurrence }) => {
 *    console.log(occurrence);
 *    return entry.isIntersecting;
 *  })
 * );
 * ```
 */
export function withOccurrence<Ctx extends {}>(
  setter: MaybeAccessor<VisibilitySetter<Ctx & { occurrence: Occurrence }>>,
): () => VisibilitySetter<Ctx> {
  if (isServer) {
    return () => () => false;
  }
  return () => {
    let prevIntersecting: boolean | undefined;
    const cb = access(setter);

    return (entry, ctx) => {
      const { isIntersecting } = entry;
      const occurrence = getOccurrence(isIntersecting, prevIntersecting);
      prevIntersecting = isIntersecting;
      return cb(entry, { ...ctx, occurrence });
    };
  };
}

export enum DirectionX {
  Left = "Left",
  Right = "Right",
  None = "None",
}

export enum DirectionY {
  Top = "Top",
  Bottom = "Bottom",
  None = "None",
}

/**
 * Calculates the direction of an element in the viewport. The direction is calculated based on the element's rect, it's previous rect and the `isIntersecting` flag.
 * @returns A direction string: `"Left"`, `"Right"`, `"Top"`, `"Bottom"` or `"None"`.
 */
export function getDirection(
  rect: DOMRectReadOnly,
  prevRect: DOMRectReadOnly | undefined,
  intersecting: boolean,
): { directionX: DirectionX; directionY: DirectionY } {
  if (isServer) {
    return {
      directionX: DirectionX.None,
      directionY: DirectionY.None,
    };
  }
  let directionX = DirectionX.None;
  let directionY = DirectionY.None;
  if (!prevRect) return { directionX, directionY };
  if (rect.top < prevRect.top) directionY = intersecting ? DirectionY.Bottom : DirectionY.Top;
  else if (rect.top > prevRect.top) directionY = intersecting ? DirectionY.Top : DirectionY.Bottom;
  if (rect.left > prevRect.left) directionX = intersecting ? DirectionX.Left : DirectionX.Right;
  else if (rect.left < prevRect.left)
    directionX = intersecting ? DirectionX.Right : DirectionX.Left;
  return { directionX, directionY };
}

/**
 * A visibility setter factory function. It provides information about element direction on the screen — `"Left"`, `"Right"`, `"Top"`, `"Bottom"` or `"None"`.
 * @param setter - A function that sets the occurrence of an element in the viewport.
 * @returns A visibility setter function.
 * @example
 * ```ts
 * const useVisibilityObserver = createVisibilityObserver(
 *  { threshold: 0.8 },
 *  withDirection((entry, { directionY, directionX, visible }) => {
 *    if (!entry.isIntersecting && directionY === "Top" && visible) {
 *      return true;
 *    }
 *    return entry.isIntersecting;
 *  })
 * );
 * ```
 */
export function withDirection<Ctx extends {}>(
  callback: MaybeAccessor<
    VisibilitySetter<Ctx & { directionX: DirectionX; directionY: DirectionY }>
  >,
): () => VisibilitySetter<Ctx> {
  if (isServer) {
    return () => () => false;
  }
  return () => {
    let prevBounds: DOMRectReadOnly | undefined;
    const cb = access(callback);

    return (entry, ctx) => {
      const { boundingClientRect } = entry;
      const direction = getDirection(boundingClientRect, prevBounds, entry.isIntersecting);
      prevBounds = boundingClientRect;
      return cb(entry, { ...ctx, ...direction });
    };
  };
}
