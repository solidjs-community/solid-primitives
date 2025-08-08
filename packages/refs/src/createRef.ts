import { onCleanup } from "solid-js";

/* ---------------------------------------------------------------- *\
 * Types
\* ---------------------------------------------------------------- */

export type RefSetter<T extends HTMLElement = HTMLElement> = (el: T | undefined) => void | (() => void);
export type RawRef<T extends HTMLElement = HTMLElement> = T | RefSetter<T> | undefined;

export interface ReturnCreateRef<T extends HTMLElement = HTMLElement> {
  /** Callback-ref to drop in JSX: `<div ref={setter} />` */
  setter: RefSetter<T>;
  /** Current element or `undefined` if unmounted */
  element: () => T | undefined;
  /** Add a listener that fires every time the ref mounts or changes */
  addEventOnChange(onChange: RefSetter<T>, key?: string, once?: boolean): void;
  /** Remove a listener; returns `true` if it existed */
  removeEventOnChange(key: string): boolean;
  /**
   * Clear internal state.
   * @param clearEvents Remove all non-default listeners
   * @param clearDefaultEvent Remove the `"default"` listener too
   * @param eventsOnly Keep `element` untouched (useful for hot-reload)
   */
  cleanup(
    clearEvents?: boolean,
    clearDefaultEvent?: boolean,
    eventsOnly?: boolean
  ): void;
}

/* ---------------------------------------------------------------- *\
 * createRef
\* ---------------------------------------------------------------- */

/**
 * Reactive callback-ref with listeners, `element()` accessor and `cleanup()`.
 *
 * ```tsx
 * const { setter: ref, element } = createRef<HTMLDivElement>();
 * ```
 *
 * @param initialOnChange initial listener (optional)
 * @param once set to `true` to run the initial listener only on first mount
 */
export function createRef<T extends HTMLElement = HTMLElement>(
  initialOnChange?: RefSetter<T>,
  once: boolean = false
): ReturnCreateRef<T> {

  /* ----------  Internal state  ------------------------------------- */
  type EventData = {
    func: RefSetter<T>;
    once: boolean;
    cleanupFn?: () => void;
  };

  let element_: T | undefined;
  let listeners: Map<string, EventData> | undefined = initialOnChange
    ? new Map([["default", { func: initialOnChange, once }]])
    : undefined;

  /* ----------  JSX ref callback  ----------------------------------- */
  const setter: RefSetter<T> = (el) => {
    if (el === element_ || !globalThis.document) return;

    if (element_ && listeners) {
      for (const data of listeners.values()) data.cleanupFn?.();
    }

    element_ = el;
    if (!listeners) return;

    for (const [key, data] of listeners.entries()) {
      const maybeCleanup = data.func(el);
      if (typeof maybeCleanup === "function") data.cleanupFn = maybeCleanup;

      if (data.once) {
        data.cleanupFn?.();
        listeners.delete(key);
      }
    }
  };

  /* ----------  Public helpers  ------------------------------------- */
  const element = () => element_;

  function addEventOnChange(
    onChange: RefSetter<T>,
    key: string = "default",
    once: boolean = false
  ): void {
    listeners?.get(key)?.cleanupFn?.();

    const data: EventData = { func: onChange, once };
    if (listeners) listeners.set(key, data);
    else listeners = new Map([[key, data]]);
  }

  const removeEventOnChange = (key: string) => {
    listeners?.get(key)?.cleanupFn?.();
    return listeners ? listeners.delete(key) : false;
  };

  function purgeEvents(
    events: Map<string, EventData>,
    clearEvents: boolean,
    clearDefaultEvent: boolean
  ): Map<string, EventData> | undefined {
    for (const [key, data] of events) {
      if (clearEvents || (clearDefaultEvent && key === "default")) {
        data.cleanupFn?.();
      }
    }

    if (clearEvents && clearDefaultEvent) return undefined;

    if (clearEvents && !clearDefaultEvent) {
      const def = events.get("default");
      return def ? new Map([["default", { ...def }]]) : undefined;
    }

    if (clearDefaultEvent) {
      events.delete("default");
    }
    return events;
  }

  function cleanup(
    clearEvents: boolean = true,
    clearDefaultEvent: boolean = true,
    eventsOnly: boolean = false
  ): void {
    if (eventsOnly && !clearEvents && !clearDefaultEvent)
      throw new Error(
        "Incompatible parameters: 'eventsOnly=true' requires either 'clearEvents=true' OR 'clearDefaultEvent=true'"
      );

    if (listeners) listeners = purgeEvents(listeners, clearEvents, clearDefaultEvent);

    if (!eventsOnly) element_ = undefined;
  }

  /* ----------  Auto-cleanup when owner disposes  -------------------- */
  onCleanup(() => cleanup());

  return {
    setter,
    element,
    addEventOnChange,
    removeEventOnChange,
    cleanup,
  };
}

/* ---------------------------------------------------------------- *\
 * Extra helpers
\* ---------------------------------------------------------------- */

/** Execute `fn(...args)` only if `fn` is a function; otherwise return `false`. */
export function exeIsFunc<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ...args: Parameters<T>
): ReturnType<T>;
export function exeIsFunc(fn: unknown, ...args: unknown[]): false;
export function exeIsFunc(fn: unknown, ...args: unknown[]): unknown {
  return fn && typeof fn === "function" ? fn(...args) : false;
}

/** Combine two refs into one (calls both). */
export function RefRef<
  A extends HTMLElement = HTMLElement,
  B extends HTMLElement = HTMLElement
>(aRef: RawRef<A>, bRef: RawRef<B>): RefSetter<A> {
  return (el) => {
    exeIsFunc(aRef, el as A);
    exeIsFunc(bRef, el as unknown as B);
  };
}