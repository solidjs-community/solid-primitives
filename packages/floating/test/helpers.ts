import type { Rect } from "../src/index.js";

export type RectInput = { x: number; y: number; width: number; height: number };

/** Gives an element a fixed (or live, when a function) bounding box; jsdom has no layout. */
export function mockRect<T extends Element>(el: T, rect: RectInput | (() => RectInput)): T {
  el.getBoundingClientRect = () => {
    const r = typeof rect === "function" ? rect() : rect;
    return {
      ...r,
      left: r.x,
      top: r.y,
      right: r.x + r.width,
      bottom: r.y + r.height,
      toJSON() {},
    } as DOMRect;
  };
  return el;
}

export const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});

export function defineGlobal(target: object, key: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, { value, configurable: true, writable: true });
  return () => {
    if (original) Object.defineProperty(target, key, original);
    else delete (target as Record<string, unknown>)[key];
  };
}
