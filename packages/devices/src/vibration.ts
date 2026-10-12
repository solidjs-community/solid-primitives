import { isServer } from "solid-js/web";

export type VibrationPattern = number | number[];

export interface VibrationReturn {
  isSupported: boolean;
  vibrate: (pattern: VibrationPattern) => boolean;
  stop: () => boolean;
}

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
