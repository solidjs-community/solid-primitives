import { createEffect, createSignal, onCleanup, JSX, getOwner } from "solid-js";
import { isServer } from "solid-js/web";
import type { Accessor } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      createFullscreen: (
        ref?: HTMLElement,
        active?: Accessor<FullscreenOptions | boolean>,
      ) => Accessor<boolean>;
    }
  }
}

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;

export const createFullscreen = (
  ref: HTMLElement | undefined,
  active?: Accessor<FullscreenOptions | boolean>,
  options?: FullscreenOptions,
): Accessor<boolean> => {
  if (isServer) {
    return () => false;
  }

  const [isActive, setActive] = createSignal(false);
  createEffect(() => {
    if (ref) {
      const activeOutput = active?.() ?? true;
      if (!isActive() && activeOutput) {
        ref
          .requestFullscreen(typeof activeOutput === "object" ? activeOutput : options)
          .then(() => setActive(true))
          .catch(() => {});
      } else if (!activeOutput && isActive()) {
        setActive(false);
        document.exitFullscreen();
      }
    }
  });
  const listener = () => setActive(document.fullscreenElement === ref);
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
