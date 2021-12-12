const globalListeners: Record<string, Set<(e: Event) => void>> = {};

// @ts-ignore
window.addEventListener = (name: string, callback: (e: Event) => void, o: any) => {
  if (!globalListeners[name]) globalListeners[name] = new Set();
  globalListeners[name].add(callback);
};
// @ts-ignore
window.removeEventListener = (name: string, callback: (e: Event) => void, o: any) => {
  if (!globalListeners[name]) return;
  globalListeners[name].delete(callback);
};

export const dispatchFakeEvent = (name: string, event: Event) => {
  if (!globalListeners[name]) return;
  [...globalListeners[name]].forEach(fn => fn(event));
};
