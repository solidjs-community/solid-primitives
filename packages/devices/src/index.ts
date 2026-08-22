import { createMemo, createSignal, getOwner, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { createStore } from "solid-js/store";

export * from "./wakelock.js";
export * from "./vibration.js";
export * from "./orientation.js";

export const createDevices = () => {
  if (isServer) {
    return () => [];
  }
  const [devices, setDevices] = createSignal<MediaDeviceInfo[]>([]);
  const enumerate = () => {
    navigator.mediaDevices.enumerateDevices().then(setDevices);
  };
  enumerate();
  navigator.mediaDevices.addEventListener("devicechange", enumerate);
  onCleanup(() => navigator.mediaDevices.removeEventListener("devicechange", enumerate));
  return devices;
};

const equalDeviceLists = (prev: MediaDeviceInfo[], next: MediaDeviceInfo[]) =>
  prev.length === next.length && prev.every(device => next.includes(device));

export const createMicrophones = () => {
  if (isServer) {
    return () => [];
  }
  const devices = createDevices();
  return createMemo(() => devices().filter(device => device.kind === "audioinput"), [], {
    name: "microphones",
    equals: equalDeviceLists,
  });
};

export const createSpeakers = () => {
  if (isServer) {
    return () => [];
  }
  const devices = createDevices();
  return createMemo(() => devices().filter(device => device.kind === "audiooutput"), [], {
    name: "speakers",
    equals: equalDeviceLists,
  });
};

export const createCameras = () => {
  if (isServer) {
    return () => [];
  }
  const devices = createDevices();
  return createMemo(() => devices().filter(device => device.kind === "videoinput"), [], {
    name: "cameras",
    equals: equalDeviceLists,
  });
};

export const createAccelerometer = (includeGravity: boolean = false, interval: number = 100) => {
  if (isServer) {
    return () => ({
      x: 0,
      y: 0,
      z: 0,
    });
  }
  const [acceleration, setAcceleration] = createSignal<DeviceMotionEventAcceleration>();
  let throttled = false;

  const accelerationEvent = (e: DeviceMotionEvent) => {
    if (throttled) return;
    throttled = true;
    setTimeout(() => {
      throttled = false;
    }, interval);

    const acceleration = includeGravity ? e.accelerationIncludingGravity : e.acceleration;
    setAcceleration(acceleration ? acceleration : undefined);
  };

  addEventListener("devicemotion", accelerationEvent);
  getOwner() && onCleanup(() => removeEventListener("devicemotion", accelerationEvent));
  return acceleration;
};

export const createGyroscope = (interval: number = 100) => {
  if (isServer) {
    return { alpha: 0, beta: 0, gamma: 0 };
  }
  const [orientation, setOrientation] = createStore({ alpha: 0, beta: 0, gamma: 0 });
  let throttled = false;

  const orientationEvent = (e: DeviceOrientationEvent) => {
    if (throttled) return;
    throttled = true;
    setTimeout(() => {
      throttled = false;
    }, interval);
    setOrientation({
      alpha: e.alpha ? e.alpha : 0,
      beta: e.beta ? e.beta : 0,
      gamma: e.gamma ? e.gamma : 0,
    });
  };

  addEventListener("deviceorientation", orientationEvent);
  getOwner() && onCleanup(() => removeEventListener("deviceorientation", orientationEvent));
  return orientation;
};
