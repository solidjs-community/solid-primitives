import { Accessor, createEffect, onCleanup, splitProps, type ComponentProps } from "solid-js";
import { spread, template } from "solid-js/web";

export type ScriptProps = Omit<ComponentProps<"script">, 'src'> & {
  src: string | Accessor<string>;
};

const scriptTag = template('<script></script>', 1);

/**
 * Creates a convenient script loader utility
 *
 * @param string URL or source of the script to load.
 * @param type Type value to put in the script attribute.
 * @param function Callback to trigger onLoad.
 * @param function callback on error.
 * @returns
 */
export const createScriptLoader = (props: ScriptProps): [
  script: HTMLScriptElement | undefined,
  remove: () => void
] => {
  if (process.env.SSR) {
    return [
      undefined,
      () => {
        /*noop*/
      }
    ];
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
      document.head.appendChild(script);
    }
  };
  load();
  createEffect(load);
  onCleanup(remove);
  return [script, remove];
};
