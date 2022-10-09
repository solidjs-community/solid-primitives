import { Accessor, createEffect, onCleanup } from "solid-js";

/**
 * Creates a convenient script loader utility
 *
 * @param string URL or source of the script to load.
 * @param type Type value to put in the script attribute.
 * @param function Callback to trigger onLoad.
 * @param function callback on error.
 * @returns
 */
export const createScriptLoader = (opts: {
  src: string | Accessor<string>;
  type?: string;
  onload?: () => void;
  onerror?: () => void;
}): [script: HTMLScriptElement | undefined, remove: () => void] => {
  const script = document.createElement("script");
  opts.type && (script.type = opts.type);
  opts.onload && script.addEventListener("load", opts.onload);
  opts.onerror && script.addEventListener("error", opts.onerror);
  const remove = () => document.head.contains(script) && document.head.removeChild(script);
  const load = () => {
    const src = typeof opts.src === "string" ? opts.src : opts.src();
    const prop = /^(https?:|\w[\.\w-_%]+|)\//.test(src) ? "src" : "textContent";
    if (script[prop] !== src) {
      script[prop] = src;
      document.head.appendChild(script);
    }
  };
  load();
  createEffect(load, false);
  onCleanup(remove);
  return [script, remove];
};
