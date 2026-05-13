import { type Accessor, createRenderEffect, onCleanup } from "solid-js";
import { assign, isServer, type ComponentProps, type JSX } from "@solidjs/web";

export type ScriptProps = Omit<ComponentProps<"script">, "src" | "textContent"> & {
  /** URL or source of the script to load. */
  src: string | Accessor<string>;
  /** arbitrary data attributes commonly used by tracking scripts */
  [dataAttribute: `data-${string}`]: any;
};

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
  const { src: srcProp } = props;

  const staticProps: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
    if (k !== "src" && !eventKeys.includes(k)) staticProps[k] = v;
  }
  assign(script, staticProps, true);

  for (const name of eventKeys) {
    const handler = props[name as keyof ScriptProps] as JSX.EventHandlerUnion<
      HTMLScriptElement,
      Event
    >;
    const eventName = /^on:?(.*)/.test(name)
      ? name.startsWith("on:")
        ? RegExp.$1
        : RegExp.$1.toLowerCase()
      : name;
    script.addEventListener(eventName, (ev: Event) => {
      Object.defineProperties(ev, {
        target: { value: script, enumerable: true },
        currentTarget: { value: script, enumerable: true },
      });
      Array.isArray(handler)
        ? handler[0](handler[1], ev)
        : typeof handler === "function" && handler.call(null, Object.assign(ev));
    });
  }

  createRenderEffect(
    () => (typeof srcProp === "string" ? srcProp : srcProp()),
    (src: string) => {
      const prop = /^(https?:|\w[\.\w-_%]+|)\//.test(src) ? "src" : "textContent";
      if (script[prop] !== src) {
        script[prop] = src;
        document.head.appendChild(script);
      }
    },
  );

  onCleanup(() => document.head.contains(script) && document.head.removeChild(script));
  return script;
}
