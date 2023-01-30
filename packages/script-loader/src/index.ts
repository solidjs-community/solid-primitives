import { Accessor, createRenderEffect, onCleanup, splitProps, type ComponentProps } from "solid-js";
import { spread, template } from "solid-js/web";

export type ScriptProps = Omit<ComponentProps<"script">, 'src'> & {
  src: string | Accessor<string>;
};

const scriptTag = template('<script></script>', 1);

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
export function createScriptLoader(props: ScriptProps): HTMLScriptElement | undefined {
  if (process.env.SSR) {
    return undefined;
  }
  const script = scriptTag.cloneNode(false) as HTMLScriptElement;
  const [local, scriptProps] = splitProps(props, ['src']);
  spread(script, scriptProps, false, true);
  const remove = () => document.head.contains(script) && document.head.removeChild(script);
  const load = () => {
    const src = typeof local.src === "string" ? local.src : local.src();
    const prop = /^(https?:|\w[\.\w-_%]+|)\//.test(src) ? "src" : "textContent";
    if (script[prop] !== src) {
      script[prop] = src;
      options.onBeforeAppend && options.onBeforeAppend(script);
      document.head.appendChild(script);
    }
  };
  load();
  createEffect(load);
  onCleanup(remove);
  return [script, remove];
};
  });
  onCleanup(() => document.head.contains(script) && document.head.removeChild(script));
  return script;
}
