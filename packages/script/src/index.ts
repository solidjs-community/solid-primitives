import { Accessor, createEffect, onCleanup } from "solid-js";

export const createScriptLoader = (opts: {
  src: string | Accessor<string>;
  type?: string
  onload?: () => void;
  onerror?: () => void
}): [script: HTMLScriptElement, remove: () => void] => {
  const script = document.createElement('script');
  script.src = typeof opts.src === 'function' ? opts.src() : opts.src;
  opts.type && (script.type = opts.type);
  opts.onload && script.addEventListener('load', opts.onload);
  opts.onerror && script.addEventListener('error', opts.onerror);
  document.head.appendChild(script);
  const remove = () => document.head.removeChild(script);

  createEffect(() => {
    script.src = typeof opts.src === 'function' ? opts.src() : opts.src;
  });
  onCleanup(remove);

  return [script, remove];
};
