import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { noop } from "@solid-primitives/utils";

export type OrientationType =
  | "landscape-primary"
  | "landscape-secondary"
  | "portrait-primary"
  | "portrait-secondary"
  | "unknown";

export interface OrientationState {
  readonly angle: number;
  readonly type: OrientationType;
}

const DEFAULT_STATE: OrientationState = { angle: 0, type: "portrait-primary" };

function angleToType(angle: number): OrientationType {
  switch (angle) {
    case 0:
      return "portrait-primary";
    case 180:
      return "portrait-secondary";
    case 90:
      return "landscape-primary";
    case -90:
    case 270:
      return "landscape-secondary";
    default:
      return "unknown";
  }
}

function readOrientation(): OrientationState {
  const orient = screen.orientation as ScreenOrientation | undefined;
  if (orient) {
    return { angle: orient.angle, type: orient.type as OrientationType };
  }
  const angle = ((window as any).orientation as number | undefined) ?? 0;
  return { angle, type: angleToType(angle) };
}

/**
 * Attaches a listener for screen orientation changes.
 *
 * Uses the [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)
 * when available, falling back to the deprecated `orientationchange` event.
 *
 * @param onChange called with the new {@link OrientationState} on every orientation change
 * @returns cleanup function to remove the listener
 *
 * @example
 * ```ts
 * const cleanup = makeOrientation(({ angle, type }) => {
 *   console.log(angle, type);
 * });
 * // remove listener
 * cleanup();
 * ```
 */
export function makeOrientation(onChange: (state: OrientationState) => void): VoidFunction {
  if (isServer) return noop;

  const handler = () => onChange(readOrientation());
  const orient = screen.orientation as ScreenOrientation | undefined;

  if (orient) {
    orient.addEventListener("change", handler);
    return () => orient.removeEventListener("change", handler);
  }

  window.addEventListener("orientationchange", handler);
  return () => window.removeEventListener("orientationchange", handler);
}

/**
 * Creates a reactive primitive tracking the screen orientation.
 *
 * Returns reactive signals for `angle` (degrees: 0, 90, 180, 270) and `type`
 * (e.g. `"portrait-primary"`). On the server, returns static defaults
 * (`angle: 0`, `type: "portrait-primary"`).
 *
 * @returns object with `angle` and `type` signal accessors
 *
 * @example
 * ```ts
 * const { angle, type } = createOrientation();
 *
 * createEffect(
 *   () => ({ angle: angle(), type: type() }),
 *   ({ angle, type }) => {
 *     console.log(angle, type);
 *   }
 * );
 * ```
 */
export function createOrientation(): {
  angle: Accessor<number>;
  type: Accessor<OrientationType>;
} {
  if (isServer) {
    return {
      angle: () => DEFAULT_STATE.angle,
      type: () => DEFAULT_STATE.type,
    };
  }

  const initial = readOrientation();
  const [angle, setAngle] = createSignal(initial.angle);
  const [type, setType] = createSignal<OrientationType>(initial.type);

  const cleanup = makeOrientation(state => {
    setAngle(state.angle);
    setType(state.type);
  });

  onCleanup(cleanup);

  return { angle, type };
}
