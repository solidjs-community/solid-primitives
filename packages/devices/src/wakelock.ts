import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface WakeLockReturn {
  isSupported: boolean;
  isActive: Accessor<boolean>;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function createWakeLock(): WakeLockReturn {
  if (isServer || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
    return {
      isSupported: false,
      isActive: () => false,
      request: async () => false,
      release: async () => {},
    };
  }

  const [isActive, setIsActive] = createSignal(false);
  let sentinel: WakeLockSentinel | null = null;
  let requested = false;

  const request = async (): Promise<boolean> => {
    requested = true;
    try {
      if (sentinel && !sentinel.released) {
        setIsActive(true);
        return true;
      }
      sentinel = await navigator.wakeLock.request("screen");
      sentinel.addEventListener("release", () => {
        setIsActive(false);
      });
      setIsActive(true);
      return true;
    } catch {
      setIsActive(false);
      return false;
    }
  };

  const release = async (): Promise<void> => {
    requested = false;
    if (sentinel && !sentinel.released) {
      await sentinel.release();
    }
    sentinel = null;
    setIsActive(false);
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible" && requested) {
      void request();
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  onCleanup(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    void release();
  });

  return {
    isSupported: true,
    isActive,
    request,
    release,
  };
}
