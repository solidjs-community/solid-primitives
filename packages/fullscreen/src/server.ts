import type { Accessor } from "solid-js";

export const createFullscreen = (
  _ref: HTMLElement | undefined,
  _active?: Accessor<FullscreenOptions | boolean>,
  _options?: FullscreenOptions
): Accessor<boolean> => {
  return () => false;
};
