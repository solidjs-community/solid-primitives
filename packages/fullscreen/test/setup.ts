let currentFullscreenElement: HTMLElement | undefined;

HTMLElement.prototype.requestFullscreen = function (
  this: HTMLElement,
  options?: FullscreenOptions,
) {
  (window as any)._fullScreenOptions = options;
  currentFullscreenElement = this;
  document.dispatchEvent(new Event("fullscreenchange"));
  return Promise.resolve();
};

Object.defineProperty(document, "fullscreenElement", {
  value: currentFullscreenElement,
  writable: false,
});

Object.defineProperty(document, "exitFullscreen", {
  value: () => {
    currentFullscreenElement = undefined;
  },
  writable: false,
});
