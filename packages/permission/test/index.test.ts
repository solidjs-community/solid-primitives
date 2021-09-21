import { createEffect, createRoot } from "solid-js";
import { createPermission } from '../src';

describe('createPermission', () => {
  test('reads permission', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const permission = createPermission('microphone' as PermissionName);
    const expectedStates = ['unknown', 'granted'];
    createEffect(() => {
      expect(permission()).toBe(expectedStates.shift());
      if (expectedStates.length === 0) {        
        dispose();
        resolve();
      }
    })
  })));

  test('reads permission updates', () => createRoot((dispose) => new Promise<void>((resolve) => {
    const permission = createPermission('camera' as PermissionName);
    const expectedStates = ['unknown', 'denied', 'granted'];
    createEffect(() => {
      expect(permission()).toBe(expectedStates.shift());
      if (expectedStates.length === 2) {
        setTimeout(() => {
          (window as any).__permissions__.camera.state = 'granted';
          (window as any).__permissions__.camera.dispatchEvent(new Event('change'));
        }, 50);
      } else if (expectedStates.length === 0) {        
        dispose();
        resolve();
      }
    })
  })))
})
