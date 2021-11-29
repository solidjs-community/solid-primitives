(window as any).__devices__ = [] as MediaDeviceInfo[];

// (navigator.mediaDevices as any) = Object.assign(new EventTarget(), {
//   enumerateDevices: () => Promise.resolve((window as any).__devices__ as MediaDeviceInfo[])
// });

// needed to create a fake event target
// because using EventTarget() resulted in weird error, when trying to use .dispatchEvent():
// => "The "event" argument must be an instance of Event. Received an instance of Event"
const listeners: (() => void)[] = [];
(navigator.mediaDevices as any) = {
  enumerateDevices: () => Promise.resolve((window as any).__devices__ as MediaDeviceInfo[]),
  addEventListener: (ev: string, cb: () => void) => listeners.push(cb),
  removeEventListener: (ev: string, cb: () => void) => listeners.splice(listeners.indexOf(cb), 1),
  dispatchFakeEvent: () => listeners.forEach(cb => cb())
};
