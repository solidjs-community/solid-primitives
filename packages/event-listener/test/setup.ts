const globalListeners: Record<string, Set<(e: Event) => void>> = {};

// @ts-ignore
window.addEventListener = (name: string, callback: (e: Event) => void, o: any) => {
  if (!globalListeners[name]) globalListeners[name] = new Set();
  // @ts-ignore
  globalListeners[name].add(callback);
};
// @ts-ignore
window.removeEventListener = (name: string, callback: (e: Event) => void, o: any) => {
  if (!globalListeners[name]) return;
  // @ts-ignore
  globalListeners[name].delete(callback);
};

export const dispatchFakeEvent = (name: string, event: Event) => {
  // @ts-ignore
  if (!globalListeners[name]) return;
  // @ts-ignore
  [...globalListeners[name]].forEach(fn => fn(event));
};
