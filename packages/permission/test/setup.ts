(window as any).__permissions__ = {
  microphone: Object.assign(new EventTarget(), { state: "granted" }),
  camera: Object.assign(new EventTarget(), { state: "denied" })
};

(navigator as any).permissions = {
  query: ({ name }) => Promise.resolve((window as any).__permissions__[name])
};
