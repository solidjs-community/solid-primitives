import { createEffect, createSignal, onCleanup, getOwner } from "solid-js";
import { isServer } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { access } from "@solid-primitives/utils";

/**
 * Reactively toggles fullscreen on a target element.
 *
 * ```ts
 * const [fs, setFs] = createSignal(false);
 *
 * // via ref signal
 * const [ref, setRef] = createSignal<HTMLElement>();
 * createFullscreen(ref, fs);
 * return <div ref={setRef} onClick={() => setFs(f => !f)}>click me</div>
 *
 * // via ref directive factory (Solid 2.0)
 * return <div ref={fullscreen(fs)} onClick={() => setFs(f => !f)}>click me</div>
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

  createEffect(
    () => ({
      node: access(ref),
      activeOutput: active?.() ?? true,
      currentActive: isActive(),
    }),
    ({ node, activeOutput, currentActive }) => {
      if (!node) return;
      if (!currentActive && activeOutput) {
        node
          .requestFullscreen(typeof activeOutput === "object" ? activeOutput : options)
          .then(() => setActive(true))
          .catch(() => {});
      } else if (!activeOutput && currentActive) {
        setActive(false);
        document.exitFullscreen();
      }
    },
  );

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

/**
 * Ref directive factory for toggling fullscreen. For use with Solid 2.0's `ref` prop.
 *
 * ```tsx
 * const [fs, setFs] = createSignal(false);
 * return <div ref={fullscreen(fs)} onClick={() => setFs(f => !f)}>click me</div>
 * ```
 */
export const fullscreen = (
  active?: Accessor<FullscreenOptions | boolean>,
  options?: FullscreenOptions,
) => {
  const [ref, setRef] = createSignal<HTMLElement>();
  createFullscreen(ref, active, options);
  return setRef as (el: HTMLElement) => void;
};
