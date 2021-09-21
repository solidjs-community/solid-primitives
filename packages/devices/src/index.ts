import { createMemo, createSignal, onCleanup } from "solid-js";

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
  const [devices, setDevices] = createSignal<MediaDeviceInfo[]>([]);
  const enumerate = () => {
    navigator.mediaDevices.enumerateDevices().then(setDevices);
  };
  enumerate();
  navigator.mediaDevices.addEventListener("devicechange", enumerate);
  onCleanup(() =>
    navigator.mediaDevices.removeEventListener("devicechange", enumerate)
  );
  return devices;
};

const equalDeviceLists = (prev: MediaDeviceInfo[], next: MediaDeviceInfo[]) => prev.length === next.length && prev.every(device => next.includes(device));

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
  const devices = createDevices();
  return createMemo(() =>
    devices().filter((device) => device.kind === "audioinput"),
    [],
    { name: 'microphones', equals: equalDeviceLists }
  );
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
  const devices = createDevices();
  return createMemo(() =>
    devices().filter((device) => device.kind === "audiooutput"),
    [],
    { name: 'speakers', equals: equalDeviceLists }
  );
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
  const devices = createDevices();
  return createMemo(() =>
    devices().filter((device) => device.kind === "videoinput"),
    [],
    { name: 'cameras', equals: equalDeviceLists }
  );
};
