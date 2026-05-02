import {
  onCleanup,
  createSignal,
  createEffect,
  createStore,
  runWithOwner,
  untrack,
  NotReadyError,
  DEV,
} from "solid-js";
import type { Accessor } from "solid-js";
import { isServer } from "solid-js/web";
import {
  access,
  type FalsyValue,
  type MaybeAccessor,
  handleDiffArray,
} from "@solid-primitives/utils";

// Sentinel for the "not yet observed" pending state.
const NOT_SET: unique symbol = Symbol();

export type AddIntersectionObserverEntry = (el: Element) => void;
export type RemoveIntersectionObserverEntry = (el: Element) => void;

export type EntryCallback = (
  entry: IntersectionObserverEntry,
  instance: IntersectionObserver,
) => void;

/**
 * Curried ref-callback form: `add(callback)` returns `(el) => void` for use as
 * a Solid `ref`. Direct imperative form: `add(el, callback)`.
 */
export type AddViewportObserverEntry = {
  (el: Element, callback: MaybeAccessor<EntryCallback>): void;
  (callback: MaybeAccessor<EntryCallback>): (el: Element) => void;
};
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

function observe(el: Element, instance: IntersectionObserver): void {
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
 * Creates a reactive Intersection Observer primitive. Returns a tuple of:
 * - A store array of {@link IntersectionObserverEntry} objects, one slot per
 *   element, updated in place whenever that element's intersection state changes.
 * - `isVisible(el)` — a pending-aware accessor that throws `NotReadyError` until
 *   the first observation fires for that element (integrates with `<Loading>`),
 *   then returns `entry.isIntersecting` reactively.
 *
 * @example
 * ```tsx
 * const [entries, isVisible] = createIntersectionObserver(elements);
 *
 * // In JSX — Loading shows fallback until first observation:
 * <Loading fallback={<p>Checking…</p>}>
 *   <Show when={isVisible(el)}><p>Visible!</p></Show>
 * </Loading>
 * ```
 */
export function createIntersectionObserver(
  elements: Accessor<Element[]>,
  options?: MaybeAccessor<IntersectionObserverInit>,
): readonly [
  entries: readonly IntersectionObserverEntry[],
  isVisible: (el: Element) => boolean,
] {
  if (isServer) {
    const isVisible = (_el: Element): boolean => {
      throw new NotReadyError("IntersectionObserver not available on server");
    };
    return [[], isVisible] as const;
  }

  const [entries, setEntries] = createStore<IntersectionObserverEntry[]>([]);
  const indexMap = new WeakMap<Element, number>();
  let nextIdx = 0;
  let trackedEls: Element[] = [];

  const ioCallback: IntersectionObserverCallback = newEntries => {
    for (const entry of newEntries) {
      let idx = indexMap.get(entry.target);
      if (idx === undefined) {
        idx = nextIdx++;
        indexMap.set(entry.target, idx);
      }
      const frozen = Object.freeze({ ...entry });
      runWithOwner(null as any, () => {
        setEntries(draft => {
          draft[idx] = frozen as any;
          if (idx >= draft.length) draft.length = idx + 1;
        });
      });
    }
  };

  let io = new IntersectionObserver(ioCallback, untrack(() => access(options)));
  onCleanup(() => io.disconnect());

  if (typeof options === "function") {
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

  // Reads the entry for the given element from the store. Throws NotReadyError
  // until the IO has fired for that element — integrates with <Loading>.
  // When called inside a reactive scope, tracks the store slot reactively.
  const isVisible = (el: Element): boolean => {
    const idx = indexMap.get(el);
    if (idx === undefined || !entries[idx])
      throw new NotReadyError("Element has not yet been observed");
    return entries[idx]!.isIntersecting;
  };

  return [entries, isVisible] as const;
}

/**
 * Creates a more advanced viewport observer for complex tracking with multiple
 * objects in a single IntersectionObserver instance.
 *
 * The `add` function has two forms:
 * - `add(el, callback)` — imperative: register element directly.
 * - `add(callback)` — returns a ref callback `(el) => void` for use as
 *   `ref={add(e => ...)}` in JSX. Replaces the old `use:intersectionObserver` directive.
 *
 * @example
 * ```tsx
 * const [add, { remove, start, stop, instance }] = createViewportObserver(els, (e) => {...});
 * add(el, e => console.log(e.isIntersecting))
 *
 * // ref usage (replaces old use: directive):
 * const [add] = createViewportObserver()
 * <div ref={add(e => console.log(e.isIntersecting))}></div>
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
      cb instanceof Function && cb(entry, instance);
    });

  const { add, remove, stop, instance } = makeIntersectionObserver([], onChange, options);

  const addEntry: AddViewportObserverEntry = (
    elOrCallback: Element | MaybeAccessor<EntryCallback>,
    callback?: MaybeAccessor<EntryCallback>,
  ): any => {
    if (elOrCallback instanceof Element) {
      add(elOrCallback);
      callbacks.set(elOrCallback, callback!);
    } else {
      // Curried ref form: add(callback) → ref callback (el) => void
      return (el: Element) => {
        add(el);
        callbacks.set(el, elOrCallback);
      };
    }
  };

  const removeEntry: RemoveViewportObserverEntry = el => {
    callbacks.delete(el);
    remove(el);
  };
  const start = () => initial.forEach(([el, cb]) => addEntry(el, cb));
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
 * When `initialValue` is omitted, `visible()` throws `NotReadyError` until the
 * first IntersectionObserver callback fires — integrates with `<Loading>` for a
 * natural loading fallback:
 *
 * ```tsx
 * const visible = createVisibilityObserver(() => el)
 *
 * <Loading fallback={<p>Checking…</p>}>
 *   <Show when={visible()} fallback={<p>Hidden</p>}>
 *     <p>Visible!</p>
 *   </Show>
 * </Loading>
 * ```
 *
 * Provide `initialValue` to opt out of the pending state and start with a known value:
 *
 * ```tsx
 * const visible = createVisibilityObserver(() => el, { initialValue: false })
 * // visible() === false immediately
 * ```
 *
 * @param element - The element to observe; may be `Accessor<Element | FalsyValue>` or a plain `Element`.
 * @param options - IntersectionObserver options plus optional `initialValue`.
 * @param setter - Optional custom setter controlling the signal value.
 */
export function createVisibilityObserver(
  element: Accessor<Element | FalsyValue> | Element,
  options?: IntersectionObserverInit & { initialValue?: boolean },
  setter?: MaybeAccessor<VisibilitySetter>,
): Accessor<boolean> {
  if (isServer) {
    if (options?.initialValue !== undefined) return () => options.initialValue!;
    return () => {
      throw new NotReadyError("Visibility not yet observed");
    };
  }

  // rawVisible tracks the actual observed value; NOT_SET means "first IO hasn't fired yet".
  const [rawVisible, setRawVisible] = createSignal<boolean | typeof NOT_SET>(
    options?.initialValue !== undefined ? options.initialValue : NOT_SET,
    { ownedWrite: true },
  );

  // Plain accessor — reading rawVisible() inside a reactive scope is tracked normally.
  // Throwing from a plain function (not a computed signal) avoids caching issues
  // when called outside a reactive scope between state transitions.
  const visible = (): boolean => {
    const val = rawVisible();
    if (val === NOT_SET) throw new NotReadyError("Visibility not yet observed");
    return val;
  };

  // access(setter) called once so factory setters (withOccurrence, withDirection)
  // create their per-element closure exactly once.
  const setterFn = setter ? access(setter) : null;
  const entryCallback: EntryCallback = setterFn
    ? entry => {
        const prev = untrack(rawVisible);
        setRawVisible(setterFn(entry, { visible: prev === NOT_SET ? false : prev }));
      }
    : entry => setRawVisible(entry.isIntersecting);

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
        if (prevEl) io.unobserve(prevEl);
        if (el) observe(el, io);
        prevEl = el;
      },
    );
  } else {
    observe(element, io);
    prevEl = element;
  }

  onCleanup(() => {
    if (prevEl) io.unobserve(prevEl);
  });

  return visible;
}

// ─── Occurrence ───────────────────────────────────────────────────────────────

export const Occurrence = {
  Entering: "Entering",
  Leaving: "Leaving",
  Inside: "Inside",
  Outside: "Outside",
} as const;
export type Occurrence = (typeof Occurrence)[keyof typeof Occurrence];

/**
 * Calculates the occurrence of an element in the viewport.
 */
export function getOccurrence(
  isIntersecting: boolean,
  prevIsIntersecting: boolean | undefined,
): Occurrence {
  return isIntersecting
    ? prevIsIntersecting
      ? Occurrence.Inside
      : Occurrence.Entering
    : prevIsIntersecting === true
      ? Occurrence.Leaving
      : Occurrence.Outside;
}

/**
 * A visibility setter factory providing occurrence context — `"Entering"`,
 * `"Leaving"`, `"Inside"`, or `"Outside"`.
 *
 * @example
 * ```ts
 * const visible = createVisibilityObserver(el, { threshold: 0.8 },
 *   withOccurrence((entry, { occurrence }) => {
 *     console.log(occurrence);
 *     return entry.isIntersecting;
 *   })
 * );
 * ```
 */
export function withOccurrence<Ctx extends {}>(
  setter: MaybeAccessor<VisibilitySetter<Ctx & { occurrence: Occurrence }>>,
): () => VisibilitySetter<Ctx> {
  if (isServer) return () => () => false;
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

// ─── Direction ────────────────────────────────────────────────────────────────

export const DirectionX = {
  Left: "Left",
  Right: "Right",
  None: "None",
} as const;
export type DirectionX = (typeof DirectionX)[keyof typeof DirectionX];

export const DirectionY = {
  Top: "Top",
  Bottom: "Bottom",
  None: "None",
} as const;
export type DirectionY = (typeof DirectionY)[keyof typeof DirectionY];

/**
 * Calculates the scroll direction of an element based on bounding rect changes.
 */
export function getDirection(
  rect: DOMRectReadOnly,
  prevRect: DOMRectReadOnly | undefined,
  intersecting: boolean,
): { directionX: DirectionX; directionY: DirectionY } {
  let directionX: DirectionX = DirectionX.None;
  let directionY: DirectionY = DirectionY.None;
  if (!prevRect) return { directionX, directionY };
  if (rect.top < prevRect.top) directionY = intersecting ? DirectionY.Bottom : DirectionY.Top;
  else if (rect.top > prevRect.top) directionY = intersecting ? DirectionY.Top : DirectionY.Bottom;
  if (rect.left > prevRect.left) directionX = intersecting ? DirectionX.Left : DirectionX.Right;
  else if (rect.left < prevRect.left)
    directionX = intersecting ? DirectionX.Right : DirectionX.Left;
  return { directionX, directionY };
}

/**
 * A visibility setter factory providing scroll direction context — `"Left"`,
 * `"Right"`, `"Top"`, `"Bottom"`, or `"None"`.
 *
 * @example
 * ```ts
 * const visible = createVisibilityObserver(el, { threshold: 0.8 },
 *   withDirection((entry, { directionY, directionX, visible }) => {
 *     if (!entry.isIntersecting && directionY === "Top" && visible) return true;
 *     return entry.isIntersecting;
 *   })
 * );
 * ```
 */
export function withDirection<Ctx extends {}>(
  callback: MaybeAccessor<
    VisibilitySetter<Ctx & { directionX: DirectionX; directionY: DirectionY }>
  >,
): () => VisibilitySetter<Ctx> {
  if (isServer) return () => () => false;
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
