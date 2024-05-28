import { createEffect, createSignal, onCleanup, JSX, getOwner } from "solid-js";
import { isServer } from "solid-js/web";
import type { Accessor } from "solid-js";
import { access } from "@solid-primitives/utils";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      createFullscreen: (
        ref?: HTMLElement | Accessor<HTMLElement | undefined>,
        active?: Accessor<FullscreenOptions | boolean>,
      ) => Accessor<boolean>;
    }
  }
}

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;

/**
 * createFullscreen - reactively toggle fullscreen
 * ```ts
 * const [fs, setFs] = createSignal(false);
 *
 * // via ref signal
 * const [ref, setRef] = createSignal<HTMLElement>();
 * createFullscreen(ref, fs);
 * return <div ref={setRef} onClick={setFs(f => !f)}>click me</div>
 *
 * // via directive:
 * return <div use:createFullscreen={fs} onClick={setFs(f => !f)}>
 *   click me
 * </div>
 * ```
 */
export const createFullscreen = (
  ref: HTMLElement | undefined | Accessor<HTMLElement | undefined>,
  active?: Accessor<FullscreenOptions | boolean>,
  options?: FullscreenOptions,
): Accessor<boolean> => {
  if (isServer) {
    return () => false;
  }

  const [isActive, setActive] = createSignal(false);
  createEffect(() => {
    const node = access(ref);
    if (node) {
      const activeOutput = active?.() ?? true;
      if (!isActive() && activeOutput) {
        node
          .requestFullscreen(typeof activeOutput === "object" ? activeOutput : options)
          .then(() => setActive(true))
          .catch(() => {});
      } else if (!activeOutput && isActive()) {
        setActive(false);
        document.exitFullscreen();
      }
    }
  });
  const listener = () => setActive(document.fullscreenElement === access(ref));
  document.addEventListener("fullscreenchange", listener);
  getOwner() &&
    onCleanup(() => {
      document.removeEventListener("fullscreenchange", listener);
      if (isActive()) {
        document.exitFullscreen();
      }
    });

  return isActive;
};
