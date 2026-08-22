import { isServer } from "solid-js/web";

export type VibrationPattern = number | number[];

export interface VibrationReturn {
  isSupported: boolean;
  vibrate: (pattern: VibrationPattern) => boolean;
  stop: () => boolean;
}

/**
 * Reactive Vibration / Haptics API wrapper.
 * Provides tactile pulse feedback for mobile buttons, toggles, success/error confirmations, and game interactions.
 *
 * @example
 * ```ts
 * const { isSupported, vibrate, stop } = createVibration();
 * vibrate(100); // 100ms pulse
 * vibrate([100, 50, 100]); // double pulse
 * ```
 */
export function createVibration(): VibrationReturn {
  if (isServer || typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return {
      isSupported: false,
      vibrate: () => false,
      stop: () => false,
    };
  }

  return {
    isSupported: true,
    vibrate: (pattern: VibrationPattern) => {
      try {
        return navigator.vibrate(pattern);
      }
      catch {
        return false;
      }
    },
    stop: () => {
      try {
        return navigator.vibrate(0);
      }
      catch {
        return false;
      }
    },
  };
}
