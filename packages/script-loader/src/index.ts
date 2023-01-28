import { Accessor, createRenderEffect, onCleanup } from "solid-js";

/**
 * Creates a convenient script loader utility
 *
 * @param src URL or source of the script to load.
 * @param type Type value to put in the script attribute.
 * @param onLoad Callback to trigger onLoad.
 * @param onError callback on error.
 * @param onBeforeAppend callback before appending the script to the document.
 * @returns The script element that was created. (will be undefined in SSR)
 */
export function createScriptLoader(options: {
  readonly src: string | Accessor<string>;
  readonly type?: string;
  readonly onLoad?: () => void;
  readonly onError?: () => void;
  readonly onBeforeAppend?: (script: HTMLScriptElement) => void;
}): HTMLScriptElement | undefined {
  if (process.env.SSR) {
    return undefined;
  }

  const script = document.createElement("script");
  options.type && (script.type = options.type);
  options.onLoad && script.addEventListener("load", options.onLoad);
  options.onError && script.addEventListener("error", options.onError);
  createRenderEffect(() => {
    const src = typeof options.src === "string" ? options.src : options.src();
    const prop = /^(https?:|\w[\.\w-_%]+|)\//.test(src) ? "src" : "textContent";
    if (script[prop] !== src) {
      script[prop] = src;
      options.onBeforeAppend && options.onBeforeAppend(script);
      document.head.appendChild(script);
    }
  });
  onCleanup(() => document.head.contains(script) && document.head.removeChild(script));
  return script;
}
