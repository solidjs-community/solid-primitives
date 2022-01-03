let online = true;

export const setOnline = (value: boolean) => {
  online = value;
  window.dispatchEvent(new Event(value ? "online" : "offline"));
};

Object.defineProperty(navigator, "onLine", {
  get: () => online
});
