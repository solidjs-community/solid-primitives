import * as API from ".";

export const createDevices: typeof API.createDevices = () => () => [];

export const createMicrophones: typeof API.createMicrophones = () => () => [];

export const createSpeakers: typeof API.createSpeakers = () => () => [];

export const createCameras: typeof API.createCameras = () => () => [];

export const createAccelerometer: typeof API.createAccelerometer = () => () => ({
  x: 0,
  y: 0,
  z: 0
});

export const createGyroscope: typeof API.createGyroscope = () => ({ alpha: 0, beta: 0, gamma: 0 });
