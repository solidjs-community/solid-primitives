import { JSX, mergeProps, MergeProps } from "solid-js";
import { access, AnyObject, chain, MaybeAccessor } from "@solid-primitives/utils";
import { propTraps } from "./propTraps";

const extractCSSregex = /([^:; ]*):\s*([^;]*)/g;

const isEventListenerKey = (key: string): boolean =>
  key[0] === "o" &&
  key[1] === "n" &&
  key.length > 2 &&
  key[2] !== ":" &&
  !key.startsWith("oncapture:");

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
    object[match[1]] = match[2];
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
export function combineStyle(a: JSX.CSSProperties, b: JSX.CSSProperties): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string,
  b: JSX.CSSProperties | string
): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string,
  b: JSX.CSSProperties | string
): JSX.CSSProperties | string {
  if (typeof a === "object" && typeof b === "object") return { ...a, ...b };
  if (typeof a === "string" && typeof b === "string") return `${a};${b}`;

  const objA = typeof a === "object" ? a : stringStyleToObject(a);
  const objB = typeof b === "object" ? b : stringStyleToObject(b);

  return { ...objA, ...objB };
}

type PropsInput = {
  class?: string;
  className?: string;
  classList?: Record<string, boolean | undefined>;
  style?: JSX.CSSProperties | string;
  ref?: Element | ((el: any) => void);
} & AnyObject;

const reduce = <K extends keyof PropsInput>(
  sources: MaybeAccessor<PropsInput>[],
  key: K,
  calc: (a: NonNullable<PropsInput[K]>, b: NonNullable<PropsInput[K]>) => PropsInput[K]
) => {
  let v: PropsInput[K] = undefined;
  for (const props of sources) {
    const propV = access(props)[key];
    if (!v) v = propV;
    else if (propV) v = calc(v, propV);
  }
  return v;
};

/**
 * A helper that reactively merges multiple props objects together while smartly combining some of Solid's JSX/DOM attributes.
 *
 * Event handlers and refs are chained, class, classNames and styles are combined.
 * For all other props, the last prop object overrides all previous ones. Similarly to {@link mergeProps}
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
export function combineProps<T extends MaybeAccessor<PropsInput>[]>(...sources: T): MergeProps<T> {
  if (sources.length === 1) return sources[0] as MergeProps<T>;

  // create a map of event listeners to be chained
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};

  for (const props of sources) {
    const propsObj = access(props);
    for (const key in propsObj) {
      if (!isEventListenerKey(key)) continue;

      const v = propsObj[key];
      const name = key.toLowerCase();

      const callback: (...args: any[]) => void =
        typeof v === "function"
          ? v
          : Array.isArray(v)
          ? v.length === 1
            ? v[0]
            : v[0].bind(void 0, v[1])
          : void 0;

      listeners[name] ? listeners[name].push(callback) : (listeners[name] = [callback]);
    }
  }

  const merge = mergeProps(...sources) as unknown as MergeProps<T>;

  return new Proxy(
    {
      get(key) {
        if (typeof key !== "string") return Reflect.get(merge, key);

        // Combine style prop
        if (key === "style") return reduce(sources, "style", combineStyle);

        // chain props.ref assignments
        if (key === "ref") {
          const callbacks: ((el: any) => void)[] = [];
          for (const props of sources) {
            const cb = access(props)[key] as ((el: any) => void) | undefined;
            if (typeof cb === "function") callbacks.push(cb);
          }
          return chain(callbacks);
        }

        // Chain event listeners
        if (isEventListenerKey(key)) {
          const callbacks = listeners[key.toLowerCase()];
          return Array.isArray(callbacks) ? chain(callbacks) : Reflect.get(merge, key);
        }

        // Merge classes or classNames
        if (key === "class" || key === "className")
          return reduce(sources, key, (a, b) => `${a} ${b}`);

        // Merge classList objects, keys in the last object overrides all previous ones.
        if (key === "classList") return reduce(sources, key, (a, b) => ({ ...a, ...b }));

        return Reflect.get(merge, key);
      },
      has(key) {
        return Reflect.has(merge, key);
      },
      keys() {
        return Object.keys(merge);
      }
    },
    propTraps
  ) as any;
}

// type check

// const com = combineProps(
//   {
//     onSomething: 123,
//     onWheel: (e: WheelEvent) => 213,
//     something: "foo",
//     style: { margin: "24px" },
//     once: true,
//     onMount: (fn: VoidFunction) => undefined
//   },
//   {
//     onSomething: [(n: number, s: string) => "fo", 123],
//     once: "ovv"
//   },
//   {
//     onWheel: false,
//     onMount: (n: number) => void 0
//   }
// );
// com.onSomething; // (s: string) => void;
// com.once; // string;
// com.onWheel; // false;
// com.onMount; // ((fn: VoidFunction) => undefined) & ((n: number) => undefined);
// com.something; // string;
// com.style; // string | JSX.CSSProperties;
