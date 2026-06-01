import { merge, type Merge } from "solid-js";
import type { JSX } from "@solidjs/web";
import { access, chain, reverseChain, type MaybeAccessor } from "@solid-primitives/utils";
import { propTraps } from "./propTraps.js";

const extractCSSregex = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;

/**
 * converts inline string styles to object form
 * @example
 * const styles = stringStyleToObject("margin: 24px; border: 1px solid #121212");
 * styles; // { margin: "24px", border: "1px solid #121212" }
 * */
export function stringStyleToObject(style: string): JSX.CSSProperties {
  const object: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = extractCSSregex.exec(style))) {
    object[match[1]!] = match[2]!;
  }
  return object;
}

/**
 * Combines two set of styles together. Accepts both string and object styles.\
 * @example
 * const styles = combineStyle("margin: 24px; border: 1px solid #121212", {
 *   margin: "2rem",
 *   padding: "16px"
 * });
 * styles; // { margin: "2rem", border: "1px solid #121212", padding: "16px" }
 */
export function combineStyle(a: string, b: string): string;
export function combineStyle(
  a: JSX.CSSProperties | undefined,
  b: JSX.CSSProperties | undefined,
): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string | undefined,
  b: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string | undefined,
  b: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties | string {
  if (typeof a === "string") {
    if (typeof b === "string") return `${a};${b}`;

    a = stringStyleToObject(a);
  } else if (typeof b === "string") {
    b = stringStyleToObject(b);
  }

  return { ...a, ...b };
}

type PropsInput = {
  class?: JSX.ClassValue;
  className?: string;
  style?: JSX.CSSProperties | string;
  ref?: Element | ((el: any) => void);
} & Record<string, any>;

const reduce = <K extends keyof PropsInput>(
  sources: MaybeAccessor<PropsInput>[],
  key: K,
  calc: (a: NonNullable<PropsInput[K]>, b: NonNullable<PropsInput[K]>) => PropsInput[K],
) => {
  let v: PropsInput[K] = undefined;
  for (const props of sources) {
    const propV = access(props)[key];
    if (!v) v = propV;
    else if (propV) v = calc(v, propV);
  }
  return v;
};

export type CombinePropsOptions = {
  /**
   * by default the event handlers will be called left-to-right,
   * following the order of the sources.
   * If this option is set to true, the handlers will be called right-to-left.
   */
  reverseEventHandlers?: boolean;
};

/**
 * A helper that reactively merges multiple props objects together while smartly combining some of Solid's JSX/DOM attributes.
 *
 * Event handlers and refs are chained, `class` and `style` are combined.
 * For all other props, the last prop object overrides all previous ones. Similarly to `merge`.
 * @param sources - Multiple sets of props to combine together.
 * @example
 * ```tsx
 * const MyButton: Component<ButtonProps> = props => {
 *    const { buttonProps } = createButton();
 *    const combined = combineProps(props, buttonProps);
 *    return <button {...combined} />
 * }
 * // component consumer can provide button props
 * // they will be combined with those provided by createButton() primitive
 * <MyButton style={{ margin: "24px" }} />
 * ```
 */
export function combineProps<T extends [] | MaybeAccessor<PropsInput>[]>(
  sources: T,
  options?: CombinePropsOptions,
): Merge<T>;
export function combineProps<T extends [] | MaybeAccessor<PropsInput>[]>(...sources: T): Merge<T>;
export function combineProps<T extends MaybeAccessor<PropsInput>[]>(
  ...args: T | [sources: T, options?: CombinePropsOptions]
): Merge<T> {
  const restArgs = Array.isArray(args[0]);
  const sources = (restArgs ? args[0] : args) as T;

  if (sources.length === 1) return sources[0] as Merge<T>;

  const chainFn =
    restArgs && (args[1] as CombinePropsOptions | undefined)?.reverseEventHandlers
      ? reverseChain
      : chain;

  // create a map of event listeners to be chained
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};

  for (const props of sources) {
    const propsObj = access(props);
    for (const key in propsObj) {
      // skip non event listeners
      if (key[0] === "o" && key[1] === "n" && key[2]) {
        const v = propsObj[key];
        const name = key.toLowerCase();

        const callback: ((...args: any[]) => void) | undefined =
          typeof v === "function"
            ? v
            : // jsx event handlers can be tuples of [callback, arg]
              Array.isArray(v)
              ? v.length === 1
                ? v[0]
                : v[0].bind(void 0, v[1])
              : void 0;

        if (callback)
          listeners[name] ? listeners[name].push(callback) : (listeners[name] = [callback]);
        else delete listeners[name];
      }
    }
  }

  const merged = merge(...sources) as unknown as Merge<T>;

  return new Proxy(
    {
      get(key) {
        if (typeof key !== "string") return Reflect.get(merged, key);

        // Combine style prop
        if (key === "style") return reduce(sources, "style", combineStyle);

        // chain props.ref assignments
        if (key === "ref") {
          const callbacks: ((el: any) => void)[] = [];
          for (const props of sources) {
            const cb = access(props)[key] as ((el: any) => void) | undefined;
            if (typeof cb === "function") callbacks.push(cb);
          }
          return chainFn(callbacks);
        }

        // Chain event listeners
        if (key[0] === "o" && key[1] === "n" && key[2]) {
          const callbacks = listeners[key.toLowerCase()];
          return callbacks ? chainFn(callbacks) : Reflect.get(merged, key);
        }

        // Combine class or className values
        if (key === "class" || key === "className") {
          const parts: JSX.ClassValue[] = [];
          for (const s of sources) {
            const v = access(s)[key];
            if (v !== undefined) parts.push(v);
          }
          if (parts.length === 0) return undefined;
          if (parts.length === 1) return parts[0];
          if (parts.every((v): v is string => typeof v === "string")) return parts.join(" ");
          return parts;
        }

        return Reflect.get(merged, key);
      },
      has(key) {
        return Reflect.has(merged, key);
      },
      keys() {
        return Object.keys(merged);
      },
    },
    propTraps,
  ) as any;
}

/**
 * Chains multiple event handlers into a single handler that calls each in order.
 * Handlers that are `null`, `undefined`, or `false` are silently skipped, making
 * it safe to pass conditional handlers directly.
 *
 * When used inline in JSX, reads from Solid's reactive props proxy are tracked
 * through the surrounding render context — no explicit signal unwrapping needed.
 * For a standalone signal holding a handler, read it before passing:
 * `combineHandlers(handler(), base)` or wrap the whole call in a `createMemo`.
 *
 * @example
 * ```tsx
 * // Inline — props.onClick is tracked via Solid's reactive props proxy
 * <button onClick={combineHandlers(props.onClick, internalHandler)} />
 *
 * // Conditional handler — null/false are safely skipped
 * <div onKeyDown={combineHandlers(props.onKeyDown, isOpen() ? closeOnEsc : null)} />
 * ```
 */
export function combineHandlers<T extends (...args: any[]) => void>(
  ...handlers: (T | null | undefined | false)[]
): T | undefined {
  const fns = handlers.filter((h): h is T => typeof h === "function");
  if (fns.length === 0) return undefined;
  if (fns.length === 1) return fns[0];
  return ((...args: any[]) => {
    for (const fn of fns) fn(...args);
  }) as T;
}
