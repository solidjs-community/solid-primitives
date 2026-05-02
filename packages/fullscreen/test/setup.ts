export const setup_state = {
  current_el: undefined as HTMLElement | undefined,
  current_options: undefined as FullscreenOptions | undefined,
};

HTMLElement.prototype.requestFullscreen = function (
  this: HTMLElement,
  options?: FullscreenOptions,
): Promise<void> {
  setup_state.current_el = this;
  setup_state.current_options = options;
  document.dispatchEvent(new Event("fullscreenchange"));
  return Promise.resolve();
};

// Dynamic getter so fullscreenElement reflects current state
Object.defineProperty(document, "fullscreenElement", {
  get: () => setup_state.current_el ?? null,
  configurable: true,
});

// exitFullscreen dispatches fullscreenchange just like a real browser
Object.defineProperty(document, "exitFullscreen", {
  value: (): Promise<void> => {
    setup_state.current_el = undefined;
    document.dispatchEvent(new Event("fullscreenchange"));
    return Promise.resolve();
  },
  writable: true,
  configurable: true,
});
