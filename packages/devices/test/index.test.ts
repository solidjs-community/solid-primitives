import { createEffect, createRoot } from 'solid-js';
import { createDevices, createMicrophones, createSpeakers, createCameras } from '../src';

describe('createDevices', () => {
  let fakeDeviceCount = 0;
  const fakeDeviceInfo = (overrides: Partial<MediaDeviceInfo> = {}): MediaDeviceInfo => ({
    deviceId: (Math.random()).toString(36).slice(2),
    groupId: (Math.random()).toString(36).slice(2),
    kind: 'audioinput',
    label: `fake device ${++fakeDeviceCount}`,
    toJSON: function() { return JSON.stringify(this); },
    ...overrides,
  })
  const setDevices = (devices: MediaDeviceInfo[]) => { (window as any).__devices__ = devices };

  test('initially reads all devices', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const deviceFakes = [fakeDeviceInfo(), fakeDeviceInfo({kind: 'audiooutput'}), fakeDeviceInfo({ kind: 'videoinput' })]
    setDevices(deviceFakes);
    const devices = createDevices();
    const expectedDevices = [[], deviceFakes];
    createEffect(() => {
      expect(devices()).toEqual(expectedDevices.shift());
      if (expectedDevices.length === 0) {
        dispose();
        resolve();
      }
    });
  })));

  test('initially reads all microphones', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const deviceFakes = [fakeDeviceInfo(), fakeDeviceInfo({kind: 'audiooutput'}), fakeDeviceInfo({ kind: 'videoinput' })]
    setDevices(deviceFakes);
    const microphones = createMicrophones();
    const expectedDevices = [[], [deviceFakes[0]]];
    createEffect(() => {
      expect(microphones()).toEqual(expectedDevices.shift());
      if (expectedDevices.length === 0) {
        dispose();
        resolve();
      }
    });
  })));

  test('initially reads all speakers', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const deviceFakes = [fakeDeviceInfo(), fakeDeviceInfo({kind: 'audiooutput'}), fakeDeviceInfo({ kind: 'videoinput' })]
    setDevices(deviceFakes);
    const speakers = createSpeakers();
    const expectedDevices = [[], [deviceFakes[1]]];
    createEffect(() => {
      expect(speakers()).toEqual(expectedDevices.shift());
      if (expectedDevices.length === 0) {
        dispose();
        resolve();
      }
    });
  })));

  test('initially reads all cameras', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const deviceFakes = [fakeDeviceInfo(), fakeDeviceInfo({kind: 'audiooutput'}), fakeDeviceInfo({ kind: 'videoinput' })]
    setDevices(deviceFakes);
    const cameras = createCameras();
    const expectedDevices = [[], [deviceFakes[2]]];
    createEffect(() => {
      expect(cameras()).toEqual(expectedDevices.shift());
      if (expectedDevices.length === 0) {
        dispose();
        resolve();
      }
    });
  })));

  test('reads updated devices', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const deviceFakes = [fakeDeviceInfo(), fakeDeviceInfo({kind: 'audiooutput'}), fakeDeviceInfo({ kind: 'videoinput' })]
    setDevices(deviceFakes.slice(0, 1));
    const devices = createDevices();
    const expectedDevices = [[], deviceFakes.slice(0,1), deviceFakes];
    createEffect(() => {
      expect(devices()).toEqual(expectedDevices.shift());
      if (expectedDevices.length === 1) {
        setDevices(deviceFakes);
        navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
      }
      if (expectedDevices.length === 0) {
        dispose();
        resolve();
      }
    });
  })));
});
