(window as any).__devices__ = [] as MediaDeviceInfo[];

(navigator.mediaDevices as any) = Object.assign(new EventTarget(), {
  enumerateDevices: () => Promise.resolve((window as any).__devices__ as MediaDeviceInfo[]),
});
