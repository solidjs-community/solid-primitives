import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface ScreenOrientationState {
  angle: number;
  type: OrientationType;
}

export interface ScreenOrientationReturn {
  isSupported: boolean;
  orientation: Accessor<ScreenOrientationState>;
  lock: (orientation: OrientationLockType) => Promise<void>;
  unlock: () => void;
}

/**
 * Reactive Screen Orientation API wrapper.
 * Observes device orientation state (`portrait-primary`, `landscape-primary`, angle) and provides programmatic orientation locking.
 *
 * @example
 * ```ts
 * const { orientation, lock, unlock } = createScreenOrientation();
 * console.log(orientation().type);
 * ```
 */
export function createScreenOrientation(): ScreenOrientationReturn {
  if (isServer || typeof screen === "undefined" || !("orientation" in screen)) {
    const fallback: Accessor<ScreenOrientationState> = () => ({
      angle: 0,
      type: "portrait-primary",
    });
    return {
      isSupported: false,
      orientation: fallback,
      lock: async () => {},
      unlock: () => {},
    };
  }

  const screenOrientation = screen.orientation;
  const [orientation, setOrientation] = createSignal<ScreenOrientationState>({
    angle: screenOrientation.angle,
    type: screenOrientation.type,
  });

  const update = () => {
    setOrientation({
      angle: screenOrientation.angle,
      type: screenOrientation.type,
    });
  };

  screenOrientation.addEventListener("change", update);
  onCleanup(() => {
    screenOrientation.removeEventListener("change", update);
  });

  return {
    isSupported: true,
    orientation,
    lock: (lockType: OrientationLockType) => screenOrientation.lock(lockType),
    unlock: () => screenOrientation.unlock(),
  };
}
