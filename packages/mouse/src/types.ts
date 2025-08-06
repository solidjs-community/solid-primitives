import { type Position } from "@solid-primitives/utils";

export type MouseSourceType = "mouse" | "touch" | null;

export type MousePosition = Position & { sourceType: MouseSourceType };
export type MousePositionInside = MousePosition & { isInside: boolean };

export interface PositionRelativeToElement extends Position {
  top: number;
  left: number;
  width: number;
  height: number;
  isInside: boolean;
}

export interface UseTouchOptions {
  /**
   * Listen to touch events. If enabled, position will be updated on `touchstart` event.
   * @default true
   */
  touch?: boolean;
}
export interface FollowTouchOptions {
  /**
   * If enabled, position will be updated on `touchmove` event.
   * @default true
   */
  followTouch?: boolean;
}
