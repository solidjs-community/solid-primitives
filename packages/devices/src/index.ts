import { createMemo, createSignal, getOwner, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

/**
 * Creates a list of all media devices
 *
 * @returns () => MediaDeviceInfo[]
 *
 * If the permissions to use the media devices are not granted, you'll get a single device of that kind with empty ids and label to show that devices are available at all.
 *
 * If the array does not contain a device of a certain kind, you cannot get permissions, as requesting permissions requires requesting a stream on any device of the kind.
 */
export const createDevices = () => {
  if (process.env.SSR) {
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

/**
 * Creates a list of all media devices that are microphones
 *
 * @returns () => MediaDeviceInfo[]
 *
 * If the microphone permissions are not granted, you'll get a single device with empty ids and label to show that devices are available at all.
 *
 * Without a device, you cannot get permissions, as requesting permissions requires requesting a stream on any device of the kind.
 */
export const createMicrophones = () => {
  if (process.env.SSR) {
    return () => [];
  }
  const devices = createDevices();
  return createMemo(() => devices().filter(device => device.kind === "audioinput"), [], {
    name: "microphones",
    equals: equalDeviceLists,
  });
};

/**
 * Creates a list of all media devices that are speakers
 *
 * @returns () => MediaDeviceInfo[]
 *
 * If the speaker permissions are not granted, you'll get a single device with empty ids and label to show that devices are available at all.
 *
 * Microphone permissions automatically include speaker permissions. You can use the device id of the speaker to use the setSinkId-API of any audio tag.
 */
export const createSpeakers = () => {
  if (process.env.SSR) {
    return () => [];
  }
  const devices = createDevices();
  return createMemo(() => devices().filter(device => device.kind === "audiooutput"), [], {
    name: "speakers",
    equals: equalDeviceLists,
  });
};

/**
 * Creates a list of all media devices that are cameras
 *
 * @returns () => MediaDeviceInfo[]
 *
 * If the camera permissions are not granted, you'll get a single device with empty ids and label to show that devices are available at all.
 *
 * Without a device, you cannot get permissions, as requesting permissions requires requesting a stream on any device of the kind.
 */
export const createCameras = () => {
  if (process.env.SSR) {
    return () => [];
  }
  const devices = createDevices();
  return createMemo(() => devices().filter(device => device.kind === "videoinput"), [], {
    name: "cameras",
    equals: equalDeviceLists,
  });
};

/**
 * Creates a reactive wrapper to get device acceleration
 * @param includeGravity boolean. default value false
 * @param interval number as ms. default value 100
 * @returnValue Acceleration: Accessor<DeviceMotionEventAcceleration | undefined>
 */
export const createAccelerometer = (includeGravity: boolean = false, interval: number = 100) => {
  if (process.env.SSR) {
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

/**
 * Creates a reactive wrapper to get device orientation
 * @param interval number as ms. default value 100
 * @returnValue { alpha: 0, beta: 0, gamma: 0 }
 */
export const createGyroscope = (interval: number = 100) => {
  if (process.env.SSR) {
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
