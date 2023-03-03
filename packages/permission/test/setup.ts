type Permission = {
  state: PermissionState;
  addEventListener: (ev: string, cb: () => void) => void;
  removeEventListener: (ev: string, cb: () => void) => void;
  __dispatchEvent: (state?: PermissionState) => void;
  __listeners: (() => void)[];
};

export const __permissions__: Record<"microphone" | "camera", Permission> = {
  microphone: {
    state: "granted",
    __listeners: [],
    __dispatchEvent: state => {
      if (state) __permissions__.microphone.state = state;
      __permissions__.microphone.__listeners.forEach(cb => cb());
    },
    addEventListener: (e, cb) => __permissions__.microphone.__listeners.push(cb),
    removeEventListener: (e, cb) =>
      __permissions__.microphone.__listeners.splice(
        __permissions__.microphone.__listeners.indexOf(cb),
        1,
      ),
  },
  camera: {
    state: "denied",
    __listeners: [],
    __dispatchEvent: state => {
      if (state) __permissions__.camera.state = state;
      __permissions__.camera.__listeners.forEach(cb => cb());
    },
    addEventListener: (e, cb) => __permissions__.camera.__listeners.push(cb),
    removeEventListener: (e, cb) =>
      __permissions__.camera.__listeners.splice(__permissions__.camera.__listeners.indexOf(cb), 1),
  },
};

(navigator as any).permissions = {
  query: ({ name }) => Promise.resolve(__permissions__[name]),
};
