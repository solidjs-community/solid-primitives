import { onCleanup } from "solid-js";

/* ---------------------------------------------------------------- *\
 * Types
\* ---------------------------------------------------------------- */

export type RefSetter<T extends HTMLElement = HTMLElement> = (el: T | undefined) => void;
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
  /* ----------  SSR fallback : return no-op impl  -------------------- */
  if (typeof window === "undefined") {
    const noop = () => {};
    const undef = () => undefined as unknown as T;
    return {
      setter: noop,
      element: undef,
      addEventOnChange: noop,
      removeEventOnChange: () => false,
      cleanup: noop,
    };
  }

  /* ----------  Internal state  ------------------------------------- */
  let element_: T | undefined;

  type Listener = { func: RefSetter<T>; once: boolean };
  let listeners: Map<string, Listener> | undefined = initialOnChange
    ? new Map([["default", { func: initialOnChange, once }]])
    : undefined;

  /* ----------  JSX ref callback  ----------------------------------- */
  const setter: RefSetter<T> = (el) => {
    element_ = el;
    if (!listeners) return;
    for (const [key, data] of listeners) {
      data.func(el);
      if (data.once) listeners.delete(key);
    }
  };

  /* ----------  Public helpers  ------------------------------------- */
  const element = () => element_;

  function addEventOnChange(
    onChange: RefSetter<T>,
    key: string = "default",
    once: boolean = false
  ): void {
    if (listeners) listeners.set(key, { func: onChange, once });
    else listeners = new Map([[key, { func: onChange, once }]]);
  }

  const removeEventOnChange = (key: string) =>
    listeners ? listeners.delete(key) : false;

  function cleanup(
    clearEvents: boolean = true,
    clearDefaultEvent: boolean = true,
    eventsOnly: boolean = false
  ): void {
    if (eventsOnly && !clearEvents && !clearDefaultEvent)
      throw new Error(
        "Incompatible parameters: 'eventsOnly=true' requires either 'clearEvents=true' OR 'clearDefaultEvent=true'"
      );

    if (!eventsOnly) element_ = undefined;

    const defaultL = listeners?.get("default");
    if (clearEvents && clearDefaultEvent) listeners = undefined;
    else if (clearEvents && !clearDefaultEvent && defaultL)
      listeners = new Map([["default", { func: defaultL.func, once: defaultL.once }]]);
    else if (clearDefaultEvent && defaultL && listeners) listeners.delete("default");
  }

  /* ----------  Auto-cleanup when owner disposes  -------------------- */
  onCleanup(cleanup);

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
