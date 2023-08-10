export const setup_state = {
  current_el: undefined as HTMLElement | undefined,
  current_options: undefined as FullscreenOptions | undefined,
};

HTMLElement.prototype.requestFullscreen = function (
  this: HTMLElement,
  options?: FullscreenOptions,
) {
  setup_state.current_el = this;
  setup_state.current_options = options;
  document.dispatchEvent(new Event("fullscreenchange"));
  return Promise.resolve();
};

Object.defineProperty(document, "fullscreenElement", {
  value: setup_state.current_el,
  writable: false,
});

Object.defineProperty(document, "exitFullscreen", {
  value: () => {
    setup_state.current_el = undefined;
  },
  writable: false,
});
