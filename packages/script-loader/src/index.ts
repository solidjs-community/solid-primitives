import {
  Accessor,
  createRenderEffect,
  onCleanup,
  splitProps,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { spread, isServer } from "solid-js/web";

export type ScriptProps = Omit<ComponentProps<"script">, "src" | "textContent"> & {
  /** URL or source of the script to load. */
  src: string | Accessor<string>;
  /** arbitrary data attributes commonly used by tracking scripts */
  [dataAttribute: `data-${string}`]: any;
};

const OMITTED_PROPS = ["src"] as const;

/**
 * Creates a convenient script loader utility
 *
 * @param props The props to spread to the script element.
 * The `src` prop is required and will be used to set the `src` or `textContent` attribute. It can be a string or an accessor.
 * @returns The script element that was created. (will be undefined in SSR)
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/script-loader#createScriptLoader
 *
 * @example
 * createScriptLoader({
 *  src: "https://example.com/script.js",
 *  onLoad() {
 *    // do your stuff...
 *  }
 * })
 */
export function createScriptLoader(props: ScriptProps): HTMLScriptElement | undefined {
  if (isServer) {
    return undefined;
  }
  const script = document.createElement("script");
  const eventKeys: string[] = Object.keys(props).filter(p => p.startsWith("on"));
  const [local, events, scriptProps] = splitProps(
    props,
    OMITTED_PROPS,
    eventKeys as readonly (keyof typeof props)[],
  );
  setTimeout(() => spread(script, scriptProps, false, true));
  createRenderEffect(() => {
    Object.entries(events).forEach(
      ([name, handler]: [string, JSX.EventHandlerUnion<HTMLScriptElement, Event>]) =>
        script.addEventListener(
          /^on:?(.*)/.test(name)
            ? name.startsWith("on:")
              ? RegExp.$1
              : RegExp.$1.toLowerCase()
            : name,
          (ev: Event) => {
            Object.defineProperties(ev, {
              target: { value: script, enumerable: true },
              currentTarget: { value: script, enumerable: true },
            });
            Array.isArray(handler)
              ? handler[0](handler[1], ev)
              : typeof handler === "function" && handler.call(null, Object.assign(ev));
          },
        ),
    );
    const src = typeof local.src === "string" ? local.src : local.src();
    const prop = /^(https?:|\w[\.\w-_%]+|)\//.test(src) ? "src" : "textContent";
    if (script[prop] !== src) {
      script[prop] = src;
      document.head.appendChild(script);
    }
  });
  onCleanup(() => document.head.contains(script) && document.head.removeChild(script));
  return script;
}
